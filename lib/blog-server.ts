import fs from 'fs';
import path from 'path';

export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  content: string;
}

const BLOGS_DIR = path.join(process.cwd(), 'data', 'blogs');

export function getAllBlogPosts(): BlogPost[] {
  try {
    const fileNames = fs.readdirSync(BLOGS_DIR);
    const allPostsData = fileNames
      .filter((name) => name.endsWith('.json'))
      .map((name) => {
        const fullPath = path.join(BLOGS_DIR, name);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(fileContents) as BlogPost;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return allPostsData;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(BLOGS_DIR, `${slug}.json`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(fileContents) as BlogPost;
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter(post => post.tags.includes(tag));
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter(post => post.tags.some(tag => 
    tag.toLowerCase().includes(category.toLowerCase())
  ));
}

export function searchBlogPosts(query: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  const lowercaseQuery = query.toLowerCase();
  
  return allPosts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.content.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getFeaturedBlogPosts(): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.slice(0, 3); // First 3 posts as featured
}

export function getRecentBlogPosts(limit: number = 5): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.slice(0, limit);
}

export function getAllTags(): string[] {
  const allPosts = getAllBlogPosts();
  const tagSet = new Set<string>();
  
  allPosts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
}

export function getCategories(): string[] {
  return ['Backend', 'AI', 'Startup', 'Architecture', 'DevOps', 'Cloud Native'];
}

export function getEstimatedReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
