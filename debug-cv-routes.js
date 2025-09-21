#!/usr/bin/env node

/**
 * Debug CV Intelligence Routes
 * Tests all endpoints to find the exact issue
 */

const axios = require('axios');

const BASE_URL = 'https://thesimpleai.vercel.app';
const LOCAL_URL = 'http://localhost:5000';

// Test configuration
const TEST_CONFIG = {
  email: 'syedarfan@securemaxtech.com',
  password: 'admin123'
};

let authToken = null;

async function testEndpoint(url, method = 'GET', data = null, headers = {}) {
  try {
    console.log(`\n🧪 Testing ${method} ${url}`);
    
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ SUCCESS: ${response.status} - ${response.statusText}`);
    console.log(`📄 Response:`, JSON.stringify(response.data, null, 2).substring(0, 500));
    return response.data;
  } catch (error) {
    console.log(`❌ FAILED: ${error.response?.status || 'No Status'} - ${error.message}`);
    if (error.response?.data) {
      console.log(`📄 Error Response:`, JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function login() {
  console.log('\n🔐 Attempting login...');
  const loginData = await testEndpoint(`${BASE_URL}/api/auth/login`, 'POST', TEST_CONFIG);
  
  if (loginData && loginData.success && loginData.tokens) {
    authToken = loginData.tokens.accessToken;
    console.log('✅ Login successful, token obtained');
    return true;
  } else {
    console.log('❌ Login failed');
    return false;
  }
}

async function testCVRoutes() {
  if (!authToken) {
    console.log('❌ No auth token available');
    return;
  }
  
  const authHeaders = {
    'Authorization': `Bearer ${authToken}`
  };
  
  console.log('\n🧪 Testing CV Intelligence Routes...');
  
  // Test 1: Health check (no auth)
  await testEndpoint(`${BASE_URL}/api/cv-intelligence/test`);
  
  // Test 2: Get batches (with auth)
  await testEndpoint(`${BASE_URL}/api/cv-intelligence/batches`, 'GET', null, authHeaders);
  
  // Test 3: Create batch (with auth)
  await testEndpoint(`${BASE_URL}/api/cv-intelligence`, 'POST', { name: 'Debug Test Batch' }, authHeaders);
  
  // Test 4: Test auth endpoint if available
  await testEndpoint(`${BASE_URL}/api/cv-intelligence/test-auth`, 'GET', null, authHeaders);
  
  // Test 5: Debug user endpoint
  await testEndpoint(`${BASE_URL}/api/debug/user`, 'GET', null, authHeaders);
  
  // Test 6: Route listing
  await testEndpoint(`${BASE_URL}/api/debug/routes`);
}

async function debugRoutes() {
  console.log('🔍 CV Intelligence Route Debugging Tool');
  console.log('=====================================');
  
  // Test basic connectivity
  console.log('\n🌐 Testing basic connectivity...');
  await testEndpoint(`${BASE_URL}/health`);
  await testEndpoint(`${BASE_URL}/api/test`);
  
  // Try to login
  const loginSuccess = await login();
  
  if (loginSuccess) {
    // Test CV routes
    await testCVRoutes();
  } else {
    console.log('\n⚠️ Cannot test authenticated routes without login');
  }
  
  console.log('\n🏁 Debug complete!');
}

// Run the debug
debugRoutes().catch(console.error);
