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

const BLOGS_DIR = path.join(process.cwd(), 'data');

// Cache for blog posts to improve performance
let blogPostsCache: BlogPost[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getAllBlogPosts(): BlogPost[] {
  try {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (blogPostsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return blogPostsCache;
    }
    
    const allPostsData: BlogPost[] = [];
    
    // Get all category directories
    const categoryDirs = fs.readdirSync(BLOGS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Read posts from each category
    for (const categoryDir of categoryDirs) {
      const categoryPath = path.join(BLOGS_DIR, categoryDir);
      
      // Check if directory exists and is readable
      if (!fs.existsSync(categoryPath)) {
        continue;
      }
      
      const fileNames = fs.readdirSync(categoryPath);
      
      const categoryPosts = fileNames
        .filter((name) => name.endsWith('.json'))
        .map((name) => {
          try {
            const fullPath = path.join(categoryPath, name);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            return JSON.parse(fileContents) as BlogPost;
          } catch (fileError) {
            console.warn(`Error reading file ${name}:`, fileError);
            return null;
          }
        })
        .filter((post): post is BlogPost => post !== null);
      
      allPostsData.push(...categoryPosts);
    }
    
    // Sort by date (newest first)
    const sortedPosts = allPostsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Update cache
    blogPostsCache = sortedPosts;
    cacheTimestamp = now;
    
    return sortedPosts;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return blogPostsCache || [];
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    // Search through all category directories
    const categoryDirs = fs.readdirSync(BLOGS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const categoryDir of categoryDirs) {
      const categoryPath = path.join(BLOGS_DIR, categoryDir);
      const fileNames = fs.readdirSync(categoryPath);
      
      const matchingFile = fileNames.find(name => name === `${slug}.json`);
      if (matchingFile) {
        const fullPath = path.join(categoryPath, matchingFile);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(fileContents) as BlogPost;
      }
    }
    
    return null;
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
  try {
    const categoryPath = path.join(BLOGS_DIR, category);
    
    // Check if category directory exists
    if (!fs.existsSync(categoryPath)) {
      return [];
    }
    
    const fileNames = fs.readdirSync(categoryPath);
    const categoryPosts = fileNames
      .filter((name) => name.endsWith('.json'))
      .map((name) => {
        const fullPath = path.join(categoryPath, name);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(fileContents) as BlogPost;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return categoryPosts;
  } catch (error) {
    console.error(`Error reading blog posts for category ${category}:`, error);
    return [];
  }
}

export function getAllCategories(): string[] {
  try {
    const categoryDirs = fs.readdirSync(BLOGS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    return categoryDirs;
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
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
