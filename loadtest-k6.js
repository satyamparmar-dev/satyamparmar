/**
 * k6 Load Test Configuration
 * 
 * This script tests your website with concurrent users.
 * 
 * Installation:
 *   1. Download k6 from https://k6.io/docs/getting-started/installation/
 *   2. Or: choco install k6 (Windows with Chocolatey)
 * 
 * Usage:
 *   k6 run loadtest-k6.js
 * 
 * Customize:
 *   - Change target URL below
 *   - Adjust virtual users (vus) and duration
 *   - Modify scenarios to test different pages
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    // Ramp-up: Gradually increase to 20 users over 30 seconds
    { duration: '30s', target: 20 },
    
    // Sustained: Stay at 20 users for 1 minute
    { duration: '1m', target: 20 },
    
    // Ramp-up: Increase to 50 users over 30 seconds
    { duration: '30s', target: 50 },
    
    // Sustained: Stay at 50 users for 1 minute
    { duration: '1m', target: 50 },
    
    // Ramp-down: Decrease to 0 users over 30 seconds
    { duration: '30s', target: 0 },
  ],
  
  thresholds: {
    // 95% of requests must complete below 2 seconds
    http_req_duration: ['p(95)<2000'],
    
    // 99% of requests must complete below 5 seconds
    http_req_duration: ['p(99)<5000'],
    
    // Error rate must be less than 1%
    errors: ['rate<0.01'],
    
    // Must have less than 5% of requests fail
    http_req_failed: ['rate<0.05'],
  },
};

// Base URL - Change this to your website URL
const BASE_URL = 'https://satyamparmar-dev.github.io/satyamparmar';

// List of blog slugs to test (update with your actual blog posts)
const blogSlugs = [
  'incident-playbook-for-beginners',
  'llm-integration-guide',
  'rest-api-best-practices',
  'microservices-architecture',
  'startup-tech-stack',
  'cloud-native-backend',
  'ai-backend-integration',
  'kafka-interview-simulation',
];

// List of categories to test
const categories = [
  'backend-engineering',
  'ai',
  'startup-world',
  'tech-innovations',
];

/**
 * Test homepage
 */
function testHomepage() {
  const response = http.get(`${BASE_URL}/`);
  
  const success = check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 2000ms': (r) => r.timing.duration < 2000,
    'homepage has content': (r) => r.body.length > 0,
    'homepage is HTML': (r) => r.headers['Content-Type']?.includes('text/html'),
  });
  
  errorRate.add(!success);
  
  sleep(1); // Wait 1 second between requests
}

/**
 * Test blog listing page
 */
function testBlogListing() {
  const response = http.get(`${BASE_URL}/blog`);
  
  const success = check(response, {
    'blog listing status is 200': (r) => r.status === 200,
    'blog listing response time < 2000ms': (r) => r.timing.duration < 2000,
    'blog listing has content': (r) => r.body.length > 0,
  });
  
  errorRate.add(!success);
  
  sleep(1);
}

/**
 * Test individual blog post
 */
function testBlogPost() {
  const randomSlug = blogSlugs[Math.floor(Math.random() * blogSlugs.length)];
  const response = http.get(`${BASE_URL}/blog/${randomSlug}`);
  
  const success = check(response, {
    'blog post status is 200': (r) => r.status === 200,
    'blog post response time < 2000ms': (r) => r.timing.duration < 2000,
    'blog post has content': (r) => r.body.length > 0,
  });
  
  errorRate.add(!success);
  
  sleep(1);
}

/**
 * Test category page
 */
function testCategoryPage() {
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const response = http.get(`${BASE_URL}/category/${randomCategory}`);
  
  const success = check(response, {
    'category page status is 200': (r) => r.status === 200,
    'category page response time < 2000ms': (r) => r.timing.duration < 2000,
    'category page has content': (r) => r.body.length > 0,
  });
  
  errorRate.add(!success);
  
  sleep(1);
}

/**
 * Test about page
 */
function testAboutPage() {
  const response = http.get(`${BASE_URL}/about`);
  
  const success = check(response, {
    'about page status is 200': (r) => r.status === 200,
    'about page response time < 2000ms': (r) => r.timing.duration < 2000,
  });
  
  errorRate.add(!success);
  
  sleep(1);
}

/**
 * Test contact page
 */
function testContactPage() {
  const response = http.get(`${BASE_URL}/contact`);
  
  const success = check(response, {
    'contact page status is 200': (r) => r.status === 200,
    'contact page response time < 2000ms': (r) => r.timing.duration < 2000,
  });
  
  errorRate.add(!success);
  
  sleep(1);
}

/**
 * Main test function - executed by each virtual user
 */
export default function () {
  // Randomly choose a scenario to simulate real user behavior
  const scenarios = [
    testHomepage,
    testBlogListing,
    testBlogPost,
    testCategoryPage,
    testAboutPage,
    testContactPage,
  ];
  
  // Each user performs 3-5 random actions
  const numActions = Math.floor(Math.random() * 3) + 3; // 3-5 actions
  
  for (let i = 0; i < numActions; i++) {
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    randomScenario();
  }
}

