/**
 * Uncategorized topics & short articles (markdown under this folder).
 *
 * To add a post:
 * 1. Create `your-slug.md` in `src/content/blog/`.
 * 2. Import it with `?raw` below.
 * 3. Append to BLOG_POSTS and blogMarkdownBySlug with the same slug.
 */
import intellijShortcuts from './intellij-shortcuts.md?raw';

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  /** Shown in the hero chip, e.g. "Productivity" */
  tag?: string;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'intellij-shortcuts',
    title: 'IntelliJ IDEA shortcuts every developer should know',
    description:
      'Navigation, editing, refactoring, run/debug, and VCS — bindings that save time for Java and JVM developers.',
    tag: 'Productivity',
  },
];

export const blogMarkdownBySlug: Record<string, string> = {
  'intellij-shortcuts': intellijShortcuts,
};

export function getBlogPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogMarkdown(slug: string): string | undefined {
  return blogMarkdownBySlug[slug];
}
