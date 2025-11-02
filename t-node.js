[1mdiff --git a/loadtest-node.js b/loadtest-node.js[m
[1mindex 20886a9..6f97da8 100644[m
[1m--- a/loadtest-node.js[m
[1m+++ b/loadtest-node.js[m
[36m@@ -17,8 +17,13 @@[m [mconst http = require('http');[m
 [m
 // Configuration - CHANGE THESE[m
 const TARGET_URL = 'https://satyamparmar-dev.github.io/satyamparmar';[m
[31m-const CONCURRENT_USERS = 50;  // Number of concurrent users[m
[31m-const TOTAL_REQUESTS = 500;    // Total requests to send[m
[32m+[m[32m// Test with multiple concurrent user counts[m
[32m+[m[32mconst TEST_CONFIGS = [[m
[32m+[m[32m  { users: 50, requests: 500 },[m
[32m+[m[32m  { users: 100, requests: 1000 },[m
[32m+[m[32m  { users: 150, requests: 1500 },[m
[32m+[m[32m  { users: 200, requests: 2000 }[m
[32m+[m[32m];[m
 const TIMEOUT = 5000;          // Request timeout (5 seconds)[m
 [m
 // Test endpoints - ALL PAGES[m
[36m@@ -188,24 +193,32 @@[m [mfunction calculateStats() {[m
 }[m
 [m
 /**[m
[31m- * Run load test[m
[32m+[m[32m * Reset statistics[m
  */[m
[31m-async function runLoadTest() {[m
[31m-  console.log('='.repeat(60));[m
[31m-  console.log('Node.js Load Test (No Dependencies Required)');[m
[31m-  console.log('='.repeat(60));[m
[31m-  console.log('');[m
[32m+[m[32mfunction resetStats() {[m
[32m+[m[32m  stats.total = 0;[m
[32m+[m[32m  stats.success = 0;[m
[32m+[m[32m  stats.errors = 0;[m
[32m+[m[32m  stats.timeouts = 0;[m
[32m+[m[32m  stats.responseTimes = [];[m
[32m+[m[32m  stats.statusCodes = {};[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m/**[m
[32m+[m[32m * Run a single load test configuration[m
[32m+[m[32m */[m
[32m+[m[32masync function runSingleLoadTest(CONCURRENT_USERS, TOTAL_REQUESTS) {[m
[32m+[m[32m  console.log('\n');[m
[32m+[m[32m  console.log('='.repeat(80));[m
[32m+[m[32m  console.log(`Load Test: ${CONCURRENT_USERS} Concurrent Users, ${TOTAL_REQUESTS} Total Requests`);[m
[32m+[m[32m  console.log('='.repeat(80));[m
   console.log(`Target URL: ${TARGET_URL}`);[m
[31m-  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);[m
[31m-  console.log(`Total Requests: ${TOTAL_REQUESTS}`);[m
   console.log(`Timeout: ${TIMEOUT}ms`);[m
   console.log('');[m
[31m-  console.log('Test Endpoints:');[m
[31m-  ENDPOINTS.forEach(ep => console.log(`  - ${ep}`));[m
[31m-  console.log('');[m
   console.log('Starting load test...');[m
   console.log('');[m
   [m
[32m+[m[32m  resetStats();[m
   const startTime = Date.now();[m
   [m
   // Run requests in batches (concurrent users)[m
[36m@@ -216,8 +229,8 @@[m [masync function runLoadTest() {[m
     batches.push(Promise.all(batch));[m
     [m
     // Progress indicator[m
[31m-    if ((i + batchSize) % CONCURRENT_USERS === 0) {[m
[31m-      process.stdout.write(`\rProgress: ${Math.min(i + batchSize, TOTAL_REQUESTS)}/${TOTAL_REQUESTS} requests`);[m
[32m+[m[32m    if ((i + batchSize) % (CONCURRENT_USERS * 5) === 0 || i + batchSize >= TOTAL_REQUESTS) {[m
[32m+[m[32m      process.stdout.write(`\rProgress: ${Math.min(i + batchSize, TOTAL_REQUESTS)}/${TOTAL_REQUESTS} requests (${stats.success} success, ${stats.errors + stats.timeouts} errors)`);[m
     }[m
   }[m
   [m
[36m@@ -227,10 +240,9 @@[m [masync function runLoadTest() {[m
   const duration = (endTime - startTime) / 1000;[m
   [m
   console.log('\n');[m
[31m-  console.log('='.repeat(60));[m
[31m-  console.log('Test Results');[m
[31m-  console.log('='.repeat(60));[m
[31m-  console.log('');[m
[32m+[m[32m  console.log('-'.repeat(80));[m
[32m+[m[32m  console.log(`Test Results - ${CONCURRENT_USERS} Concurrent Users`);[m
[32m+[m[32m  console.log('-'.repeat(80));[m
   console.log(`Total Duration: ${duration.toFixed(2)} seconds`);[m
   console.log(`Total Requests: ${stats.total}`);[m
   console.log(`Successful: ${stats.success} (${((stats.success / stats.total) * 100).toFixed(2)}%)`);[m
[36m@@ -252,13 +264,12 @@[m [masync function runLoadTest() {[m
   [m
   console.log('Status Codes:');[m
   Object.entries(stats.statusCodes).forEach(([code, count]) => {[m
[31m-    console.log(`  ${code}: ${count}`);[m
[32m+[m[32m    console.log(`  ${code}: ${count} (${((count / stats.total) * 100).toFixed(2)}%)`);[m
   });[m
   console.log('');[m
   [m
   console.log(`Throughput: ${(stats.total / duration).toFixed(2)} requests/second`);[m
   console.log('');[m
[31m-  console.log('='.repeat(60));[m
   [m
   // Performance assessment[m
   if (stats.responseTimes.length > 0) {[m
[36m@@ -293,9 +304,74 @@[m [masync function runLoadTest() {[m
     }[m
   }[m
   [m
[31m-  console.log('='.repeat(60));[m
[32m+[m[32m  return {[m
[32m+[m[32m    concurrentUsers: CONCURRENT_USERS,[m
[32m+[m[32m    totalRequests: TOTAL_REQUESTS,[m
[32m+[m[32m    duration,[m
[32m+[m[32m    ...stats,[m
[32m+[m[32m    timing: stats.responseTimes.length > 0 ? calculateStats() : null[m
[32m+[m[32m  };[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m/**[m
[32m+[m[32m * Run all load tests[m
[32m+[m[32m */[m
[32m+[m[32masync function runLoadTest() {[m
[32m+[m[32m  console.log('='.repeat(80));[m
[32m+[m[32m  console.log('Node.js Load & Performance Test Suite');[m
[32m+[m[32m  console.log('='.repeat(80));[m
[32m+[m[32m  console.log('');[m
[32m+[m[32m  console.log(`Target URL: ${TARGET_URL}`);[m
[32m+[m[32m  console.log('Test Configurations:');[m
[32m+[m[32m  TEST_CONFIGS.forEach(config => {[m
[32m+[m[32m    console.log(`  - ${config.users} concurrent users, ${config.requests} total requests`);[m
[32m+[m[32m  });[m
[32m+[m[32m  console.log('');[m
[32m+[m[32m  console.log('Test Endpoints:');[m
[32m+[m[32m  ENDPOINTS.forEach(ep => console.log(`  - ${ep}`));[m
[32m+[m[32m  console.log('');[m
[32m+[m[41m  [m
[32m+[m[32m  const allResults = [];[m
[32m+[m[41m  [m
[32m+[m[32m  // Run each test configuration[m
[32m+[m[32m  for (const config of TEST_CONFIGS) {[m
[32m+[m[32m    const result = await runSingleLoadTest(config.users, config.requests);[m
[32m+[m[32m    allResults.push(result);[m
[32m+[m[41m    [m
[32m+[m[32m    // Wait a bit between tests to avoid overwhelming the server[m
[32m+[m[32m    if (config !== TEST_CONFIGS[TEST_CONFIGS.length - 1]) {[m
[32m+[m[32m      console.log('\nWaiting 5 seconds before next test...\n');[m
[32m+[m[32m      await new Promise(resolve => setTimeout(resolve, 5000));[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
[32m+[m[41m  [m
[32m+[m[32m  // Summary Report[m
[32m+[m[32m  console.log('\n');[m
[32m+[m[32m  console.log('='.repeat(80));[m
[32m+[m[32m  console.log('SUMMARY REPORT - All Load Tests');[m
[32m+[m[32m  console.log('='.repeat(80));[m
[32m+[m[32m  console.log('');[m
[32m+[m[32m  console.log('Performance Comparison Across Different User Loads:');[m
[32m+[m[32m  console.log('');[m
[32m+[m[32m  console.log('Concurrent Users | Mean (ms) | P95 (ms) | P99 (ms) | Success Rate | Throughput (req/s)');[m
[32m+[m[32m  console.log('-'.repeat(80));[m
[32m+[m[41m  [m
[32m+[m[32m  allResults.forEach(result => {[m
[32m+[m[32m    const mean = result.timing ? result.timing.mean.toFixed(0) : 'N/A';[m
[32m+[m[32m    const p95 = result.timing ? result.timing.p95.toFixed(0) : 'N/A';[m
[32m+[m[32m    const p99 = result.timing ? result.timing.p99.toFixed(0) : 'N/A';[m
[32m+[m[32m    const successRate = ((result.success / result.total) * 100).toFixed(2);[m
[32m+[m[32m    const throughput = (result.total / result.duration).toFixed(2);[m
[32m+[m[41m    [m
[32m+[m[32m    console.log([m
[32m+[m[32m      `${String(result.concurrentUsers).padStart(16)} | ${String(mean).padStart(9)} | ${String(p95).padStart(7)} | ${String(p99).padStart(7)} | ${String(successRate + '%').padStart(12)} | ${String(throughput).padStart(18)}`[m
[32m+[m[32m    );[m
[32m+[m[32m  });[m
[32m+[m[41m  [m
[32m+[m[32m  console.log('');[m
[32m+[m[32m  console.log('='.repeat(80));[m
 }[m
 [m
[31m-// Run the test[m
[32m+[m[32m// Run the test suite[