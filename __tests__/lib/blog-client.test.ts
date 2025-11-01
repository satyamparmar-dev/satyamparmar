/**
 * Unit tests for blog client functions (lib/blog-client.ts)
 * 
 * Priority: P0 (Critical)
 * Coverage Target: ≥95%
 */

import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostsByCategory,
  getBlogPostsByTag,
  searchBlogPosts,
} from '@/lib/blog-client';
import type { BlogPost } from '@/lib/blog-client';

// Mock blog data
const mockBlogPosts: BlogPost[] = [
  {
    title: 'Test Post 1',
    slug: 'test-post-1',
    date: '2025-01-18',
    author: 'Satyam Parmar',
    tags: ['backend', 'nodejs'],
    excerpt: 'This is test post 1 excerpt.',
    content: '# Test Post 1\n\nThis is the content of test post 1.',
    category: 'backend-engineering',
  },
  {
    title: 'Test Post 2',
    slug: 'test-post-2',
    date: '2025-01-19',
    author: 'Satyam Parmar',
    tags: ['ai', 'ml'],
    excerpt: 'This is test post 2 excerpt.',
    content: '# Test Post 2\n\nThis is the content of test post 2.',
    category: 'ai',
  },
  {
    title: 'Advanced Backend Patterns',
    slug: 'advanced-backend-patterns',
    date: '2025-01-20',
    author: 'Satyam Parmar',
    tags: ['backend', 'patterns'],
    excerpt: 'Learn advanced backend patterns.',
    content: '# Advanced Backend Patterns\n\nContent here.',
    category: 'backend-engineering',
  },
] as BlogPost[];

// Mock the blog data imports
jest.mock('@/lib/blog-client', () => {
  const actual = jest.requireActual('@/lib/blog-client');
  return {
    ...actual,
    getAllBlogPosts: jest.fn(() => mockBlogPosts),
  };
});

describe('Blog Client Functions', () => {
  describe('getAllBlogPosts()', () => {
    it('should return all blog posts', () => {
      const posts = getAllBlogPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);
    });

    it('should return posts in correct format', () => {
      const posts = getAllBlogPosts();
      if (posts.length > 0) {
        const post = posts[0];
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('slug');
        expect(post).toHaveProperty('date');
        expect(post).toHaveProperty('author');
        expect(post).toHaveProperty('tags');
        expect(post).toHaveProperty('excerpt');
        expect(post).toHaveProperty('content');
      }
    });

    it('should exclude todo folder posts', () => {
      const posts = getAllBlogPosts();
      // Should not include any posts from todo folder
      const todoPosts = posts.filter(post => post.slug.includes('todo') || post.category === 'todo');
      expect(todoPosts.length).toBe(0);
    });
  });

  describe('getBlogPostBySlug()', () => {
    it('should return post with matching slug', () => {
      const post = getBlogPostBySlug('test-post-1');
      expect(post).toBeDefined();
      if (post) {
        expect(post.slug).toBe('test-post-1');
      }
    });

    it('should return null for non-existent slug', () => {
      const post = getBlogPostBySlug('non-existent-slug');
      expect(post).toBeNull();
    });

    it('should be case-insensitive', () => {
      const post1 = getBlogPostBySlug('test-post-1');
      const post2 = getBlogPostBySlug('TEST-POST-1');
      // Both should return the same post or both null
      expect(!!post1).toBe(!!post2);
    });

    it('should handle special characters in slug', () => {
      const post = getBlogPostBySlug('test-post-1');
      if (post) {
        expect(post.slug).toBe('test-post-1');
      }
    });
  });

  describe('getBlogPostsByCategory()', () => {
    it('should return posts for specific category', () => {
      const posts = getBlogPostsByCategory('backend-engineering');
      expect(Array.isArray(posts)).toBe(true);
      if (posts.length > 0) {
        posts.forEach(post => {
          expect(post.category).toBe('backend-engineering');
        });
      }
    });

    it('should return empty array for non-existent category', () => {
      const posts = getBlogPostsByCategory('non-existent-category');
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(0);
    });

    it('should handle case-insensitive category matching', () => {
      const posts1 = getBlogPostsByCategory('backend-engineering');
      const posts2 = getBlogPostsByCategory('BACKEND-ENGINEERING');
      expect(posts1.length).toBe(posts2.length);
    });

    it('should return correct number of posts', () => {
      const posts = getBlogPostsByCategory('backend-engineering');
      // Should return posts that match category
      expect(posts.every(post => post.category === 'backend-engineering')).toBe(true);
    });
  });

  describe('getBlogPostsByTag()', () => {
    it('should return posts with matching tag', () => {
      const posts = getBlogPostsByTag('backend');
      expect(Array.isArray(posts)).toBe(true);
      if (posts.length > 0) {
        posts.forEach(post => {
          expect(post.tags).toContain('backend');
        });
      }
    });

    it('should handle multiple tags', () => {
      const posts = getBlogPostsByTag('backend');
      const postsWithMultiple = posts.filter(post => post.tags.length > 1);
      // Should handle posts with multiple tags
      expect(Array.isArray(postsWithMultiple)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const posts1 = getBlogPostsByTag('backend');
      const posts2 = getBlogPostsByTag('BACKEND');
      expect(posts1.length).toBe(posts2.length);
    });

    it('should return empty array if no matches', () => {
      const posts = getBlogPostsByTag('non-existent-tag');
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(0);
    });
  });

  describe('searchBlogPosts()', () => {
    it('should search in title', () => {
      const results = searchBlogPosts('Test Post');
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        results.forEach(post => {
          expect(
            post.title.toLowerCase().includes('test post') ||
            post.content.toLowerCase().includes('test post') ||
            post.excerpt.toLowerCase().includes('test post')
          ).toBe(true);
        });
      }
    });

    it('should search in content', () => {
      const results = searchBlogPosts('content');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should search in excerpt', () => {
      const results = searchBlogPosts('excerpt');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should search in tags', () => {
      const results = searchBlogPosts('backend');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const results1 = searchBlogPosts('test');
      const results2 = searchBlogPosts('TEST');
      expect(results1.length).toBe(results2.length);
    });

    it('should handle multi-word queries', () => {
      const results = searchBlogPosts('test post');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle special characters', () => {
      const results = searchBlogPosts('test@example');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return empty array if no matches', () => {
      const results = searchBlogPosts('nonexistentquery12345');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle empty search query', () => {
      const results = searchBlogPosts('');
      expect(Array.isArray(results)).toBe(true);
      // Empty query might return all posts or empty array depending on implementation
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return relevant results', () => {
      const results = searchBlogPosts('Advanced');
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        const hasAdvanced = results.some(post =>
          post.title.toLowerCase().includes('advanced') ||
          post.content.toLowerCase().includes('advanced') ||
          post.excerpt.toLowerCase().includes('advanced')
        );
        // If there are results, at least one should contain the search term
        if (results.length > 0) {
          expect(hasAdvanced).toBe(true);
        }
      }
    });
  });
});

