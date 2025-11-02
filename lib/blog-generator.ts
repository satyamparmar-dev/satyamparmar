// Blog data generator for large-scale testing
// This simulates 20,000+ blog posts for testing pagination

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  views: number;
  isPremium?: boolean;
  isVIP?: boolean;
}

// Sample data for generating realistic blog posts
const TOPICS = {
  'Backend Engineering': [
    'Microservices Architecture', 'API Design Patterns', 'Database Optimization',
    'Caching Strategies', 'Load Balancing', 'Message Queues', 'Event Sourcing',
    'CQRS Implementation', 'Distributed Systems', 'Service Mesh'
  ],
  'AI & ML': [
    'Neural Networks', 'Deep Learning', 'Natural Language Processing',
    'Computer Vision', 'Reinforcement Learning', 'MLOps', 'Model Deployment',
    'Feature Engineering', 'Data Preprocessing', 'Model Optimization'
  ],
  'DevOps & Infrastructure': [
    'Docker Containers', 'Kubernetes Orchestration', 'CI/CD Pipelines',
    'Infrastructure as Code', 'Monitoring & Logging', 'Auto Scaling',
    'Cloud Migration', 'Security Hardening', 'Disaster Recovery'
  ],
  'Database & Performance': [
    'Query Optimization', 'Index Strategies', 'Connection Pooling',
    'Replication & Sharding', 'NoSQL vs SQL', 'Data Modeling',
    'Performance Tuning', 'Caching Layers', 'Data Warehousing'
  ],
  'Security': [
    'Authentication & Authorization', 'Encryption Methods', 'Vulnerability Assessment',
    'Penetration Testing', 'Security Headers', 'OAuth & JWT', 'Zero Trust',
    'Data Privacy', 'Compliance Standards', 'Threat Modeling'
  ],
  'Architecture': [
    'System Design', 'Scalability Patterns', 'Design Principles',
    'SOLID Principles', 'Clean Architecture', 'Hexagonal Architecture',
    'Domain-Driven Design', 'Event-Driven Architecture', 'CQRS & Event Sourcing'
  ],
  'Startup & Business': [
    'Tech Stack Selection', 'MVP Development', 'Scaling Strategies',
    'Team Building', 'Product Management', 'User Experience',
    'Market Research', 'Funding Strategies', 'Growth Hacking'
  ],
  'Tech Innovations': [
    'Edge Computing', 'Quantum Computing', 'Blockchain Technology',
    'IoT Development', '5G Networks', 'AR/VR Applications',
    'Serverless Computing', 'GraphQL', 'WebAssembly'
  ]
};

const AUTHORS = [
  'Pass Gen', 'Sarah Chen', 'Alex Rodriguez', 'Maria Garcia', 'David Kim',
  'Emma Wilson', 'James Brown', 'Lisa Zhang', 'Michael Johnson', 'Anna Smith',
  'Robert Taylor', 'Jennifer Lee', 'Christopher Davis', 'Amanda White',
  'Daniel Martinez', 'Jessica Thompson', 'Matthew Anderson', 'Ashley Thomas'
];

const TAGS = [
  'Node.js', 'Python', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular',
  'Express.js', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Laravel',
  'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Elasticsearch', 'Cassandra',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible',
  'Jenkins', 'GitLab CI', 'GitHub Actions', 'Prometheus', 'Grafana',
  'Microservices', 'API', 'GraphQL', 'REST', 'gRPC', 'WebSocket',
  'Security', 'Authentication', 'Authorization', 'JWT', 'OAuth',
  'Performance', 'Optimization', 'Caching', 'CDN', 'Load Balancing',
  'Testing', 'Unit Testing', 'Integration Testing', 'E2E Testing',
  'DevOps', 'CI/CD', 'Infrastructure', 'Monitoring', 'Logging'
];

const EXCERPTS = [
  'Learn the essential patterns and best practices for building scalable applications.',
  'A comprehensive guide to implementing modern development techniques.',
  'Discover advanced strategies that will transform your development workflow.',
  'Master the fundamentals and advanced concepts in this detailed tutorial.',
  'Explore real-world examples and practical implementations you can use today.',
  'Understand the theory and practice behind modern software development.',
  'Get hands-on experience with industry-standard tools and methodologies.',
  'Learn from real-world case studies and expert insights.',
  'Master the art of building robust and maintainable software systems.',
  'Discover the secrets to writing clean, efficient, and scalable code.'
];

// Generate a single blog post
function generateBlogPost(id: number): BlogPost {
  const categories = Object.keys(TOPICS);
  const category = categories[Math.floor(Math.random() * categories.length)];
  const topics = TOPICS[category as keyof typeof TOPICS];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
  const excerpt = EXCERPTS[Math.floor(Math.random() * EXCERPTS.length)];
  
  // Generate random tags (2-5 tags)
  const numTags = Math.floor(Math.random() * 4) + 2;
  const shuffledTags = [...TAGS].sort(() => 0.5 - Math.random());
  const tags = shuffledTags.slice(0, numTags);
  
  // Generate title variations
  const titleVariations = [
    `How to ${topic}: A Complete Guide`,
    `${topic} Best Practices for 2024`,
    `Mastering ${topic}: From Beginner to Expert`,
    `Advanced ${topic} Techniques You Need to Know`,
    `${topic} Implementation: A Step-by-Step Tutorial`,
    `The Ultimate Guide to ${topic}`,
    `${topic} Patterns and Anti-patterns`,
    `Building Scalable Systems with ${topic}`,
    `${topic} in Production: Lessons Learned`,
    `Modern ${topic}: Trends and Future Directions`
  ];
  
  const title = titleVariations[Math.floor(Math.random() * titleVariations.length)];
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Generate random date (last 2 years)
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 2);
  const randomTime = startDate.getTime() + Math.random() * (Date.now() - startDate.getTime());
  const date = new Date(randomTime).toISOString().split('T')[0];
  
  // Generate content
  const content = `# ${title}\n\n${excerpt}\n\n## Introduction\n\nThis comprehensive guide covers everything you need to know about ${topic.toLowerCase()}.\n\n## Key Concepts\n\n- Concept 1: Understanding the fundamentals\n- Concept 2: Advanced techniques\n- Concept 3: Best practices\n\n## Implementation\n\nHere's how to implement ${topic.toLowerCase()} in your projects...\n\n## Conclusion\n\n${topic} is an essential skill for modern developers.`;
  
  // Determine if it's premium or VIP (10% premium, 2% VIP)
  const rand = Math.random();
  const isVIP = rand < 0.02;
  const isPremium = rand >= 0.02 && rand < 0.12;
  
  // Generate views (more for older posts)
  const daysSincePublished = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
  const baseViews = Math.floor(Math.random() * 1000) + 100;
  const views = Math.floor(baseViews + (daysSincePublished * 2));
  
  // Calculate read time (5-15 minutes)
  const readTime = Math.floor(Math.random() * 11) + 5;
  
  return {
    id: id.toString(),
    title,
    slug,
    date,
    author,
    tags,
    excerpt,
    content,
    category,
    readTime,
    views,
    isPremium,
    isVIP
  };
}

// Generate multiple blog posts
export function generateBlogPosts(count: number): BlogPost[] {
  const posts: BlogPost[] = [];
  
  for (let i = 1; i <= count; i++) {
    posts.push(generateBlogPost(i));
  }
  
  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Generate sample data for different scales
export const BLOG_SCALES = {
  SMALL: 100,      // 100 posts - for testing
  MEDIUM: 1000,    // 1,000 posts - for development
  LARGE: 10000,    // 10,000 posts - for performance testing
  MASSIVE: 20000   // 20,000+ posts - production scale
};

// Lazy loading for large datasets
export class BlogDataManager {
  private posts: BlogPost[] = [];
  private loadedPages: Set<number> = new Set();
  private postsPerPage = 1000; // Load 1000 posts at a time
  
  constructor(private totalPosts: number = BLOG_SCALES.MASSIVE) {}
  
  async getPosts(page: number = 1): Promise<BlogPost[]> {
    if (!this.loadedPages.has(page)) {
      // Generate posts for this page
      const startId = (page - 1) * this.postsPerPage + 1;
      const endId = Math.min(page * this.postsPerPage, this.totalPosts);
      const pagePosts = generateBlogPosts(endId - startId + 1).map((post, index) => ({
        ...post,
        id: (startId + index).toString()
      }));
      
      this.posts.push(...pagePosts);
      this.loadedPages.add(page);
    }
    
    return this.posts;
  }
  
  async searchPosts(query: string, page: number = 1): Promise<BlogPost[]> {
    const posts = await this.getPosts(page);
    const lowercaseQuery = query.toLowerCase();
    
    return posts.filter(post => 
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      post.author.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  getTotalPosts(): number {
    return this.totalPosts;
  }
  
  getLoadedPosts(): number {
    return this.posts.length;
  }
}

// Export singleton instance
export const blogDataManager = new BlogDataManager(BLOG_SCALES.MASSIVE);
