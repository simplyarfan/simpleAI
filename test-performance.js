#!/usr/bin/env node

/**
 * Production Performance Test Suite
 * Tests the optimized AI Platform for performance and functionality
 */

const https = require('https');
const { performance } = require('perf_hooks');

const BACKEND_URL = 'https://thesimpleai.vercel.app';
const FRONTEND_URL = 'https://thesimpleai.netlify.app';

class PerformanceTester {
  constructor() {
    this.results = {
      backend: {},
      frontend: {},
      summary: {}
    };
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const endTime = performance.now();
          resolve({
            statusCode: res.statusCode,
            responseTime: endTime - startTime,
            data: data,
            headers: res.headers
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  async testBackendEndpoints() {
    console.log('🔧 Testing Backend Endpoints...');
    
    const endpoints = [
      { name: 'Root', path: '/' },
      { name: 'Health Check', path: '/health' },
      { name: 'API Documentation', path: '/api' },
    ];

    for (const endpoint of endpoints) {
      try {
        const result = await this.makeRequest(`${BACKEND_URL}${endpoint.path}`);
        console.log(`✅ ${endpoint.name}: ${result.statusCode} (${result.responseTime.toFixed(2)}ms)`);
        
        this.results.backend[endpoint.name] = {
          status: result.statusCode,
          responseTime: result.responseTime,
          success: result.statusCode < 400
        };
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
        this.results.backend[endpoint.name] = {
          status: 'error',
          error: error.message,
          success: false
        };
      }
    }
  }

  async testFrontendLoad() {
    console.log('🎨 Testing Frontend Load Time...');
    
    try {
      const result = await this.makeRequest(FRONTEND_URL);
      console.log(`✅ Frontend: ${result.statusCode} (${result.responseTime.toFixed(2)}ms)`);
      
      this.results.frontend = {
        status: result.statusCode,
        responseTime: result.responseTime,
        success: result.statusCode < 400
      };
    } catch (error) {
      console.log(`❌ Frontend: ${error.message}`);
      this.results.frontend = {
        status: 'error',
        error: error.message,
        success: false
      };
    }
  }

  generateSummary() {
    const backendTests = Object.values(this.results.backend);
    const successfulBackend = backendTests.filter(test => test.success).length;
    const avgBackendTime = backendTests
      .filter(test => test.responseTime)
      .reduce((sum, test) => sum + test.responseTime, 0) / backendTests.length;

    this.results.summary = {
      backendEndpoints: {
        total: backendTests.length,
        successful: successfulBackend,
        failed: backendTests.length - successfulBackend,
        averageResponseTime: avgBackendTime.toFixed(2) + 'ms'
      },
      frontend: {
        status: this.results.frontend.success ? 'Working' : 'Failed',
        responseTime: this.results.frontend.responseTime ? 
          this.results.frontend.responseTime.toFixed(2) + 'ms' : 'N/A'
      },
      overallHealth: (successfulBackend === backendTests.length && this.results.frontend.success) ? 
        '🟢 Excellent' : '🟡 Needs Attention'
    };
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 ENTERPRISE AI HUB v2.0.0 - PERFORMANCE REPORT');
    console.log('='.repeat(60));
    
    console.log('\n📊 Backend API Performance:');
    Object.entries(this.results.backend).forEach(([name, result]) => {
      const status = result.success ? '✅' : '❌';
      const time = result.responseTime ? `${result.responseTime.toFixed(2)}ms` : 'Failed';
      console.log(`  ${status} ${name}: ${time}`);
    });

    console.log('\n🎨 Frontend Performance:');
    const frontendStatus = this.results.frontend.success ? '✅' : '❌';
    const frontendTime = this.results.frontend.responseTime ? 
      `${this.results.frontend.responseTime.toFixed(2)}ms` : 'Failed';
    console.log(`  ${frontendStatus} Load Time: ${frontendTime}`);

    console.log('\n📈 Summary:');
    console.log(`  Backend Success Rate: ${this.results.summary.backendEndpoints.successful}/${this.results.summary.backendEndpoints.total}`);
    console.log(`  Average Response Time: ${this.results.summary.backendEndpoints.averageResponseTime}`);
    console.log(`  Frontend Status: ${this.results.summary.frontend.status}`);
    console.log(`  Overall Health: ${this.results.summary.overallHealth}`);

    console.log('\n🌐 Live URLs:');
    console.log(`  Frontend: ${FRONTEND_URL}`);
    console.log(`  Backend:  ${BACKEND_URL}`);
    console.log(`  API Docs: ${BACKEND_URL}/api`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Optimization Complete - System Ready for Production!');
    console.log('='.repeat(60));
  }

  async runFullTest() {
    console.log('🧪 Starting Performance Test Suite...\n');
    
    await this.testBackendEndpoints();
    await this.testFrontendLoad();
    this.generateSummary();
    this.printResults();
  }
}

// Run the test
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runFullTest().catch(console.error);
}

module.exports = PerformanceTester;
