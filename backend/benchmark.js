#!/usr/bin/env node

const http = require('http');
const { performance } = require('perf_hooks');

/**
 * Simple benchmark script for API endpoints
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = 10;
const TOTAL_REQUESTS = 100;

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function benchmark(endpoint, options = {}) {
  console.log(`\nBenchmarking: ${endpoint}`);
  console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Total requests: ${TOTAL_REQUESTS}`);
  
  const results = [];
  const startTime = performance.now();
  
  for (let batch = 0; batch < TOTAL_REQUESTS / CONCURRENT_REQUESTS; batch++) {
    const promises = [];
    
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
      const requestStart = performance.now();
      promises.push(
        makeRequest(`${BASE_URL}${endpoint}`, options)
          .then(result => ({
            ...result,
            responseTime: performance.now() - requestStart
          }))
          .catch(error => ({
            error: error.message,
            responseTime: performance.now() - requestStart
          }))
      );
    }
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }
  
  const totalTime = performance.now() - startTime;
  const successfulRequests = results.filter(r => !r.error && r.statusCode < 400);
  const failedRequests = results.filter(r => r.error || r.statusCode >= 400);
  
  const responseTimes = successfulRequests.map(r => r.responseTime);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  
  console.log(`\nResults:`);
  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Successful requests: ${successfulRequests.length}/${TOTAL_REQUESTS}`);
  console.log(`Failed requests: ${failedRequests.length}`);
  console.log(`Requests per second: ${(TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2)}`);
  console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Min response time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`Max response time: ${maxResponseTime.toFixed(2)}ms`);
}

async function runBenchmarks() {
  console.log('🚀 Starting API benchmarks...');
  
  // Test health endpoint
  await benchmark('/api/auth/health');
  
  // Test registration endpoint
  await benchmark('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: `test${Date.now()}@securemaxtech.com`,
      password: 'TestPassword123!',
      first_name: 'Benchmark',
      last_name: 'User'
    })
  });
  
  console.log('\n✅ Benchmarks completed!');
}

if (require.main === module) {
  runBenchmarks().catch(console.error);
}

module.exports = { benchmark, makeRequest };