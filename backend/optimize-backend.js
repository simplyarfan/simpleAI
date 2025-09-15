#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Backend optimization script for performance and code structure
 */

function optimizeServerJs() {
  const filePath = path.join(__dirname, 'server.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Add compression middleware
  if (!content.includes('compression')) {
    const compressionImport = "const compression = require('compression');\n";
    content = content.replace("const express = require('express');", 
      `const express = require('express');\n${compressionImport}`);
    
    const compressionMiddleware = "app.use(compression());\n";
    content = content.replace("app.use(express.json({ limit: '50mb' }));", 
      `app.use(compression());\napp.use(express.json({ limit: '50mb' }));`);
  }

  // Add helmet for security
  if (!content.includes('helmet')) {
    const helmetImport = "const helmet = require('helmet');\n";
    content = content.replace("const express = require('express');", 
      `const express = require('express');\n${helmetImport}`);
    
    content = content.replace("app.use(compression());", 
      `app.use(helmet());\napp.use(compression());`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Optimized server.js with compression and security headers');
}

function optimizeDatabaseJs() {
  const filePath = path.join(__dirname, 'models', 'database.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Optimize connection pool settings
  const optimizedPoolConfig = `
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,                    // Maximum number of clients in the pool
      min: 2,                     // Minimum number of clients in the pool
      idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
      connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
      acquireTimeoutMillis: 60000,   // Return an error after 60 seconds if a client could not be acquired
      createTimeoutMillis: 30000,    // Return an error after 30 seconds if a new client could not be created
      destroyTimeoutMillis: 5000,    // Return an error after 5 seconds if a client could not be destroyed
      reapIntervalMillis: 1000,      // Check for idle clients every second
      createRetryIntervalMillis: 200, // Retry creating a client every 200ms
    });`;

  // Replace existing pool configuration
  content = content.replace(/this\.pool = new Pool\({[\s\S]*?}\);/, optimizedPoolConfig);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Optimized database connection pool configuration');
}

function addPerformanceMiddleware() {
  const middlewarePath = path.join(__dirname, 'middleware', 'performance.js');
  
  const performanceMiddleware = `const responseTime = require('response-time');

/**
 * Performance monitoring middleware
 */

// Response time middleware
const responseTimeMiddleware = responseTime((req, res, time) => {
  // Log slow requests (> 1 second)
  if (time > 1000) {
    console.warn(\`Slow request: \${req.method} \${req.url} - \${time.toFixed(2)}ms\`);
  }
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    console[\`\${logLevel}\`](\`\${req.method} \${req.url} - \${res.statusCode} - \${duration}ms\`);
  });
  
  next();
};

// Memory usage monitoring
const memoryMonitor = (req, res, next) => {
  const used = process.memoryUsage();
  const memoryUsageMB = {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  };
  
  // Log memory usage if heap usage is high
  if (memoryUsageMB.heapUsed > 100) {
    console.warn('High memory usage:', memoryUsageMB);
  }
  
  next();
};

module.exports = {
  responseTimeMiddleware,
  requestLogger,
  memoryMonitor
};`;

  fs.writeFileSync(middlewarePath, performanceMiddleware, 'utf8');
  console.log('✓ Created performance monitoring middleware');
}

function updatePackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Add performance and security dependencies
  const newDependencies = {
    'compression': '^1.7.4',
    'helmet': '^7.1.0',
    'response-time': '^2.3.2'
  };

  packageJson.dependencies = { ...packageJson.dependencies, ...newDependencies };

  // Add performance scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'analyze': 'node --inspect server.js',
    'profile': 'node --prof server.js',
    'benchmark': 'node benchmark.js'
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('✓ Updated package.json with performance dependencies');
}

function createBenchmarkScript() {
  const benchmarkPath = path.join(__dirname, 'benchmark.js');
  
  const benchmarkScript = `#!/usr/bin/env node

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
  console.log(\`\\nBenchmarking: \${endpoint}\`);
  console.log(\`Concurrent requests: \${CONCURRENT_REQUESTS}\`);
  console.log(\`Total requests: \${TOTAL_REQUESTS}\`);
  
  const results = [];
  const startTime = performance.now();
  
  for (let batch = 0; batch < TOTAL_REQUESTS / CONCURRENT_REQUESTS; batch++) {
    const promises = [];
    
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
      const requestStart = performance.now();
      promises.push(
        makeRequest(\`\${BASE_URL}\${endpoint}\`, options)
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
  
  console.log(\`\\nResults:\`);
  console.log(\`Total time: \${totalTime.toFixed(2)}ms\`);
  console.log(\`Successful requests: \${successfulRequests.length}/\${TOTAL_REQUESTS}\`);
  console.log(\`Failed requests: \${failedRequests.length}\`);
  console.log(\`Requests per second: \${(TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2)}\`);
  console.log(\`Average response time: \${avgResponseTime.toFixed(2)}ms\`);
  console.log(\`Min response time: \${minResponseTime.toFixed(2)}ms\`);
  console.log(\`Max response time: \${maxResponseTime.toFixed(2)}ms\`);
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
      email: \`test\${Date.now()}@securemaxtech.com\`,
      password: 'TestPassword123!',
      first_name: 'Benchmark',
      last_name: 'User'
    })
  });
  
  console.log('\\n✅ Benchmarks completed!');
}

if (require.main === module) {
  runBenchmarks().catch(console.error);
}

module.exports = { benchmark, makeRequest };`;

  fs.writeFileSync(benchmarkPath, benchmarkScript, 'utf8');
  fs.chmodSync(benchmarkPath, '755');
  console.log('✓ Created benchmark script');
}

console.log('🚀 Starting backend optimization...\n');

// Create middleware directory if it doesn't exist
const middlewareDir = path.join(__dirname, 'middleware');
if (!fs.existsSync(middlewareDir)) {
  fs.mkdirSync(middlewareDir);
}

optimizeServerJs();
optimizeDatabaseJs();
addPerformanceMiddleware();
updatePackageJson();
createBenchmarkScript();

console.log('\n✅ Backend optimization completed!');
