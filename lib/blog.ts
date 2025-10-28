// Client-side blog utilities
// Server-side functions are in blog-server.ts

export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  content: string;
}

export function getEstimatedReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function getCategories(): string[] {
  return ['Backend', 'AI', 'Startup', 'Architecture', 'DevOps', 'Cloud Native'];
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
