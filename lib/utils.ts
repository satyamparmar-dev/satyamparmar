import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export function generateMetadata(title: string, description: string, keywords: string[] = []) {
  return {
    title: `${title} | Backend Engineering Blog`,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: `${title} | Backend Engineering Blog`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Backend Engineering Blog`,
      description,
    },
  };
}

export function getEstimatedReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generates a consistent ID from heading text for use in TOC and anchor links.
 * This ensures TOC items match exactly with rendered heading IDs.
 */
export function generateHeadingId(text: string | React.ReactNode): string {

  // Convert React nodes to string
  let textStr: string;
  if (typeof text === 'string') {
    textStr = text;
  } else if (Array.isArray(text)) {
    textStr = text
      .map((node) => {
        if (typeof node === 'string') return node;
        if (typeof node === 'object' && node !== null && 'props' in node) {
          return typeof node.props.children === 'string' 
            ? node.props.children 
            : String(node.props.children || '');
        }
        return String(node || '');
      })
      .join('');
  } else if (typeof text === 'object' && text !== null) {
    textStr = String(text);
  } else {
    textStr = String(text || '');
  }

  // Normalize common connector symbols to words for stable IDs
  const normalized = textStr
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' and ');

  // Clean and generate ID
  return normalized
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim();
}