/**
 * Simple Node.js Load Test (No Dependencies Required)
 * 
 * Uses only built-in Node.js modules (http/https)
 * No installation needed - just Node.js which you already have!
 * 
 * Usage:
 *   node loadtest-node.js
 * 
 * Customize:
 *   - Change TARGET_URL below
 *   - Adjust CONCURRENT_USERS and TOTAL_REQUESTS
 */

const https = require('https');
const http = require('http');

// Configuration - CHANGE THESE
const TARGET_URL = 'https://satyamparmar-dev.github.io/satyamparmar';
const CONCURRENT_USERS = 50;  // Number of concurrent users
const TOTAL_REQUESTS = 500;    // Total requests to send
const TIMEOUT = 5000;          // Request timeout (5 seconds)

// Test endpoints - ALL PAGES
const ENDPOINTS = [
  // Main pages
  '/',
  '/blog',
  '/about',
  '/contact',
  '/premium',
  '/setup',
  
  // Category pages
  '/category/backend-engineering',
  '/category/ai',
  '/category/startup-world',
  '/category/tech-innovations',
  
  // Blog posts - from data/blogs
  '/blog/incident-playbook-for-beginners',
  '/blog/ai-backend-integration',
  '/blog/cloud-native-backend',
  '/blog/kafka-interview-simulation',
  '/blog/microservices-architecture',
  '/blog/startup-tech-stack',
  
  // Blog posts - from data/category folders
  '/blog/llm-integration-guide',
  '/blog/vector-databases',
  '/blog/database-optimization',
  '/blog/performance-monitoring',
  '/blog/security-best-practices',
  '/blog/rest-api-best-practices',
  '/blog/tech-stack-selection',
  '/blog/edge-computing',
  
  // System pages
  '/feed.xml',
  '/sitemap.xml',
  '/robots.txt'
];

// Statistics
const stats = {
  total: 0,
  success: 0,
  errors: 0,
  timeouts: 0,
  responseTimes: [],
  statusCodes: {}
};

/**
 * Make a single HTTP/HTTPS request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js Load Test'
      },
      timeout: TIMEOUT
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        
        resolve({
          statusCode,
          responseTime,
          size: data.length,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Run a single user session
 */
async function runUserSession() {
  const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const url = TARGET_URL + endpoint;
  
  try {
    const result = await makeRequest(url);
    
    stats.total++;
    stats.success++;
    stats.responseTimes.push(result.responseTime);
    
    // Track status codes
    if (!stats.statusCodes[result.statusCode]) {
      stats.statusCodes[result.statusCode] = 0;
    }
    stats.statusCodes[result.statusCode]++;
    
    return result;
  } catch (error) {
    stats.total++;
    
    if (error.message === 'Request timeout') {
      stats.timeouts++;
    } else {
      stats.errors++;
    }
    
    return null;
  }
}

/**
 * Calculate statistics
 */
function calculateStats() {
  const responseTimes = stats.responseTimes.sort((a, b) => a - b);
  const count = responseTimes.length;
  
  if (count === 0) {
    return {
      mean: 0,
      median: 0,
      p95: 0,
      p99: 0,
      min: 0,
      max: 0
    };
  }
  
  const mean = responseTimes.reduce((a, b) => a + b, 0) / count;
  const median = responseTimes[Math.floor(count / 2)];
  const p95 = responseTimes[Math.floor(count * 0.95)];
  const p99 = responseTimes[Math.floor(count * 0.99)];
  const min = responseTimes[0];
  const max = responseTimes[count - 1];
  
  return { mean, median, p95, p99, min, max };
}

/**
 * Run load test
 */
async function runLoadTest() {
  console.log('='.repeat(60));
  console.log('Node.js Load Test (No Dependencies Required)');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Target URL: ${TARGET_URL}`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`Timeout: ${TIMEOUT}ms`);
  console.log('');
  console.log('Test Endpoints:');
  ENDPOINTS.forEach(ep => console.log(`  - ${ep}`));
  console.log('');
  console.log('Starting load test...');
  console.log('');
  
  const startTime = Date.now();
  
  // Run requests in batches (concurrent users)
  const batches = [];
  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_USERS) {
    const batchSize = Math.min(CONCURRENT_USERS, TOTAL_REQUESTS - i);
    const batch = Array(batchSize).fill().map(() => runUserSession());
    batches.push(Promise.all(batch));
    
    // Progress indicator
    if ((i + batchSize) % CONCURRENT_USERS === 0) {
      process.stdout.write(`\rProgress: ${Math.min(i + batchSize, TOTAL_REQUESTS)}/${TOTAL_REQUESTS} requests`);
    }
  }
  
  await Promise.all(batches);
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n');
  console.log('='.repeat(60));
  console.log('Test Results');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Total Duration: ${duration.toFixed(2)} seconds`);
  console.log(`Total Requests: ${stats.total}`);
  console.log(`Successful: ${stats.success} (${((stats.success / stats.total) * 100).toFixed(2)}%)`);
  console.log(`Errors: ${stats.errors} (${((stats.errors / stats.total) * 100).toFixed(2)}%)`);
  console.log(`Timeouts: ${stats.timeouts} (${((stats.timeouts / stats.total) * 100).toFixed(2)}%)`);
  console.log('');
  
  if (stats.responseTimes.length > 0) {
    const timing = calculateStats();
    console.log('Response Time Statistics:');
    console.log(`  Mean: ${timing.mean.toFixed(2)} ms`);
    console.log(`  Median: ${timing.median.toFixed(2)} ms`);
    console.log(`  95th percentile: ${timing.p95.toFixed(2)} ms`);
    console.log(`  99th percentile: ${timing.p99.toFixed(2)} ms`);
    console.log(`  Min: ${timing.min.toFixed(2)} ms`);
    console.log(`  Max: ${timing.max.toFixed(2)} ms`);
    console.log('');
  }
  
  console.log('Status Codes:');
  Object.entries(stats.statusCodes).forEach(([code, count]) => {
    console.log(`  ${code}: ${count}`);
  });
  console.log('');
  
  console.log(`Throughput: ${(stats.total / duration).toFixed(2)} requests/second`);
  console.log('');
  console.log('='.repeat(60));
  
  // Performance assessment
  if (stats.responseTimes.length > 0) {
    const timing = calculateStats();
    console.log('Performance Assessment:');
    
    if (timing.mean < 500) {
      console.log('  ✅ Mean response time is EXCELLENT (< 500ms)');
    } else if (timing.mean < 1000) {
      console.log('  ✅ Mean response time is GOOD (< 1000ms)');
    } else if (timing.mean < 2000) {
      console.log('  ⚠️  Mean response time is ACCEPTABLE (< 2000ms)');
    } else {
      console.log('  ❌ Mean response time is SLOW (> 2000ms)');
    }
    
    if (timing.p95 < 1000) {
      console.log('  ✅ 95th percentile is EXCELLENT (< 1000ms)');
    } else if (timing.p95 < 2000) {
      console.log('  ✅ 95th percentile is GOOD (< 2000ms)');
    } else {
      console.log('  ⚠️  95th percentile needs improvement (> 2000ms)');
    }
    
    const errorRate = ((stats.errors + stats.timeouts) / stats.total) * 100;
    if (errorRate < 0.1) {
      console.log('  ✅ Error rate is EXCELLENT (< 0.1%)');
    } else if (errorRate < 1) {
      console.log('  ✅ Error rate is GOOD (< 1%)');
    } else {
      console.log('  ❌ Error rate needs attention (> 1%)');
    }
  }
  
  console.log('='.repeat(60));
}

// Run the test
runLoadTest().catch(console.error);

