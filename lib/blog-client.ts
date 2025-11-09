// Client-side blog data loading for static export
// This replaces the server-side file system operations

export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  content: string;
}

// Import all blog data statically (excluding todo folder)
import aiBackendIntegration from '@/data/blogs/ai-backend-integration.json';
import cloudNativeBackend from '@/data/blogs/cloud-native-backend.json';
import microservicesArchitecture from '@/data/blogs/microservices-architecture.json';
import startupTechStack from '@/data/blogs/startup-tech-stack.json';
import incidentPlaybookForBeginners from '@/data/blogs/incident-playbook-for-beginners.json';
import kafkaInterviewSimulation from '@/data/blogs/kafka-interview-simulation.json';
import javaInterviewScenarioQuestions from '@/data/blogs/java-interview-scenario-questions.json';
import systemDesignResources2025 from '@/data/blogs/system-design-resources-2025.json';
import dsaPatternsMasterGuide from '@/data/blogs/dsa-patterns-master-guide.json';
import searchingSortingMasterGuide from '@/data/blogs/searching-sorting-master-guide.json';
import seniorJavaBackendArchitectureGuide from '@/data/blogs/senior-java-backend-architecture-guide.json';

import databaseOptimization from '@/data/backend-engineering/database-optimization.json';
import performanceMonitoring from '@/data/backend-engineering/performance-monitoring.json';
import restApiBestPractices from '@/data/backend-engineering/rest-api-best-practices.json';
import securityBestPractices from '@/data/backend-engineering/security-best-practices.json';
import distributedTransactionsSagaScenarios from '@/data/backend-engineering/distributed-transactions-saga-scenarios.json';
import backendDistributedSystemsRoadmap from '@/data/backend-engineering/backend-distributed-systems-roadmap.json';
import systemDesign45ProblemsRoadmap from '@/data/backend-engineering/system-design-45-problems-roadmap.json';

import llmIntegrationGuide from '@/data/ai/llm-integration-guide.json';
import vectorDatabases from '@/data/ai/vector-databases.json';

import techStackSelection from '@/data/startup-world/tech-stack-selection.json';

import edgeComputing from '@/data/tech-innovations/edge-computing.json';

import twoPointersPattern from '@/data/dsa-algo/two-pointers-pattern.json';

import dailyTipOptimizingDatabaseQueries from '@/data/daily/daily-tip-2025-01-15.json';

// All blog posts data (only complete posts, excluding todo folder)
const allBlogPosts: BlogPost[] = [
  aiBackendIntegration,
  cloudNativeBackend,
  microservicesArchitecture,
  startupTechStack,
  databaseOptimization,
  performanceMonitoring,
  restApiBestPractices,
  securityBestPractices,
  llmIntegrationGuide,
  vectorDatabases,
  techStackSelection,
  edgeComputing,
  incidentPlaybookForBeginners,
  kafkaInterviewSimulation,
  twoPointersPattern,
  dailyTipOptimizingDatabaseQueries,
  javaInterviewScenarioQuestions,
  systemDesignResources2025,
  dsaPatternsMasterGuide,
  searchingSortingMasterGuide,
  seniorJavaBackendArchitectureGuide,
  distributedTransactionsSagaScenarios,
  backendDistributedSystemsRoadmap,
  systemDesign45ProblemsRoadmap,
];

// Cache for blog posts to improve performance
let blogPostsCache: BlogPost[] | null = null;

export function getAllBlogPosts(): BlogPost[] {
  if (blogPostsCache) {
    return blogPostsCache;
  }
  
  // Sort by date (newest first)
  const sortedPosts = allBlogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Update cache
  blogPostsCache = sortedPosts;
  
  return sortedPosts;
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const allPosts = getAllBlogPosts();
  return allPosts.find(post => post.slug === slug) || null;
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter(post => post.tags.includes(tag));
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  
  // Map category names to actual data structure
  const categoryMap: { [key: string]: string[] } = {
    'backend-engineering': ['Backend Engineering', 'Backend', 'Node.js', 'Architecture', 'DevOps'],
    'ai': ['AI', 'Machine Learning', 'LLM', 'Vector Database'],
    'dsa-algo': ['DSA', 'Algorithms', 'Data Structures', 'Interview Prep', 'Two Pointers'],
    'startup-world': ['Startup', 'Tech Stack'],
    'tech-innovations': ['Edge Computing', 'Innovation'],
    'daily': ['Daily', 'Tips'],
  };
  
  const categoryTags = categoryMap[category] || [];
  return allPosts.filter(post => 
    categoryTags.some(tag => post.tags.includes(tag))
  );
}

export function getAllCategories(): string[] {
  return ['backend-engineering', 'ai', 'dsa-algo', 'startup-world', 'tech-innovations', 'daily'];
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
  return ['Backend', 'AI', 'Startup', 'Architecture', 'DevOps', 'Cloud Native', 'Daily Bytes'];
}

export function getEstimatedReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
