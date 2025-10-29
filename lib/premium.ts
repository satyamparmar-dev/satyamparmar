// Premium content management system
import { hashUserIdentifier } from './encryption';

export interface PremiumUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  subscriptionType: 'premium' | 'vip';
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface PremiumContent {
  id: string;
  title: string;
  slug: string;
  category: 'premium' | 'vip';
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
}

// Premium user verification
export function isPremiumUser(identifier: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check localStorage for premium status
    const premiumData = localStorage.getItem('premium_user');
    if (!premiumData) return false;
    
    const userData = JSON.parse(premiumData);
    const identifierHash = hashUserIdentifier(identifier.toLowerCase());
    
    return userData.hash === identifierHash && userData.isActive;
  } catch (error) {
    console.error('Premium verification error:', error);
    return false;
  }
}

// Set premium user session
export function setPremiumUser(user: PremiumUser): void {
  if (typeof window === 'undefined') return;
  
  try {
    const userData = {
      hash: hashUserIdentifier(user.email.toLowerCase()),
      isActive: user.isActive,
      subscriptionType: user.subscriptionType,
      endDate: user.endDate,
      name: user.name
    };
    
    localStorage.setItem('premium_user', JSON.stringify(userData));
    
    // Set cookie for server-side verification (if needed)
    const expires = user.endDate ? new Date(user.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    document.cookie = `premium_user=${JSON.stringify(userData)}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
  } catch (error) {
    console.error('Error setting premium user:', error);
  }
}

// Clear premium user session
export function clearPremiumUser(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('premium_user');
  document.cookie = 'premium_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Get current premium user data
export function getCurrentPremiumUser(): PremiumUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const premiumData = localStorage.getItem('premium_user');
    if (!premiumData) return null;
    
    return JSON.parse(premiumData);
  } catch (error) {
    console.error('Error getting premium user:', error);
    return null;
  }
}

// Check if user can access specific content
export function canAccessContent(contentCategory: 'premium' | 'vip', userIdentifier?: string): boolean {
  const user = getCurrentPremiumUser();
  if (!user) return false;
  
  if (!user.isActive) return false;
  
  // Check subscription type
  if (contentCategory === 'vip' && user.subscriptionType !== 'vip') {
    return false;
  }
  
  // Check expiration
  if (user.endDate && new Date(user.endDate) < new Date()) {
    clearPremiumUser();
    return false;
  }
  
  return true;
}

// Premium content categories
export const PREMIUM_CATEGORIES = {
  PREMIUM: 'premium',
  VIP: 'vip'
} as const;

// Sample premium content (in real app, this would come from API)
export const SAMPLE_PREMIUM_CONTENT: PremiumContent[] = [
  {
    id: '1',
    title: 'Advanced Microservices Patterns',
    slug: 'advanced-microservices-patterns',
    category: 'premium',
    excerpt: 'Deep dive into advanced microservices patterns including Saga, CQRS, and Event Sourcing.',
    content: '# Advanced Microservices Patterns\n\nThis comprehensive guide covers advanced microservices patterns that every backend engineer should master.\n\n## Saga Pattern\n\nThe Saga pattern manages distributed transactions across multiple services.\n\n## CQRS (Command Query Responsibility Segregation)\n\nSeparate read and write models for better performance and scalability.\n\n## Event Sourcing\n\nStore events instead of current state for complete audit trails.',
    publishedAt: '2024-01-15',
    author: 'Pass Gen',
    tags: ['microservices', 'architecture', 'patterns']
  },
  {
    id: '2',
    title: 'VIP: Enterprise Security Best Practices',
    slug: 'enterprise-security-best-practices',
    category: 'vip',
    excerpt: 'Exclusive VIP content covering enterprise-grade security implementations.',
    content: '# Enterprise Security Best Practices\n\nThis VIP content covers advanced security implementations for enterprise applications.\n\n## Zero Trust Architecture\n\nImplement zero trust principles across your infrastructure.\n\n## Advanced Authentication\n\nMulti-factor authentication and biometric security.\n\n## Data Encryption\n\nEnd-to-end encryption strategies for sensitive data.',
    publishedAt: '2024-01-20',
    author: 'Pass Gen',
    tags: ['security', 'enterprise', 'best-practices']
  },
  {
    id: '3',
    title: 'High-Performance Database Optimization',
    slug: 'high-performance-database-optimization',
    category: 'premium',
    excerpt: 'Master database optimization techniques for handling millions of requests per second.',
    content: '# High-Performance Database Optimization\n\nLearn advanced techniques to optimize your database for high-traffic applications.\n\n## Query Optimization\n\n- Index strategies\n- Query analysis\n- Performance tuning\n\n## Connection Pooling\n\n- Pool sizing\n- Connection management\n- Load balancing\n\n## Caching Strategies\n\n- Redis implementation\n- Cache invalidation\n- Memory management',
    publishedAt: '2024-01-25',
    author: 'Pass Gen',
    tags: ['database', 'performance', 'optimization']
  },
  {
    id: '4',
    title: 'VIP: AI-Powered Backend Systems',
    slug: 'ai-powered-backend-systems',
    category: 'vip',
    excerpt: 'Exclusive VIP guide to building AI-powered backend systems with real-world examples.',
    content: '# AI-Powered Backend Systems\n\nThis VIP content reveals advanced AI integration patterns for backend systems.\n\n## Machine Learning Pipelines\n\n- Model training workflows\n- Real-time inference\n- A/B testing frameworks\n\n## AI Service Architecture\n\n- Microservices for AI\n- Load balancing ML models\n- Auto-scaling AI services\n\n## Advanced Use Cases\n\n- Recommendation engines\n- Fraud detection\n- Natural language processing',
    publishedAt: '2024-01-30',
    author: 'Pass Gen',
    tags: ['AI', 'machine-learning', 'backend', 'vip']
  }
];
