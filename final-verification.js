#!/usr/bin/env node

/**
 * COMPREHENSIVE CV INTELLIGENCE FIX VERIFICATION
 * Tests the complete authentication and API flow
 */

const axios = require('axios');

const BASE_URL = 'https://thesimpleai.vercel.app';
const TEST_CREDENTIALS = {
  email: 'syedarfan@securemaxtech.com',
  password: 'admin123'
};

let authToken = null;

async function runTest(name, testFn) {
  console.log(`\n🧪 ${name}`);
  console.log('='.repeat(50));
  
  try {
    await testFn();
    console.log(`✅ ${name} - PASSED`);
  } catch (error) {
    console.log(`❌ ${name} - FAILED:`, error.message);
    if (error.response?.data) {
      console.log('📄 Error Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function test1_BasicConnectivity() {
  const response = await axios.get(`${BASE_URL}/health`);
  console.log('📊 Health Check:', response.status, response.data.status);
}

async function test2_AuthenticationFlow() {
  const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_CREDENTIALS);
  
  console.log('📊 Login Status:', response.status);
  console.log('📊 Response Structure:');
  console.log('- success:', response.data.success);
  console.log('- token exists:', !!response.data.token);
  console.log('- refreshToken exists:', !!response.data.refreshToken);
  console.log('- user exists:', !!response.data.user);
  
  if (response.data.token) {
    authToken = response.data.token;
    console.log('🔑 Token stored for subsequent tests');
    
    // Decode JWT to verify structure
    const tokenParts = response.data.token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('🔍 JWT Payload:');
      console.log('- userId:', payload.userId, `(${typeof payload.userId})`);
      console.log('- email:', payload.email);
      console.log('- role:', payload.role);
      console.log('- expires:', new Date(payload.exp * 1000).toISOString());
    }
  } else {
    throw new Error('No authentication token received');
  }
}

async function test3_CVIntelligenceEndpoints() {
  if (!authToken) {
    throw new Error('No auth token available');
  }
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
  
  // Test 1: Basic test endpoint
  console.log('🔍 Testing basic CV Intelligence endpoint...');
  const testResponse = await axios.get(`${BASE_URL}/api/cv-intelligence/test`, { headers });
  console.log('📊 Test endpoint:', testResponse.status, '- Available routes:', testResponse.data.available_routes?.length);
  
  // Test 2: Auth test endpoint
  console.log('🔍 Testing authenticated endpoint...');
  const authTestResponse = await axios.get(`${BASE_URL}/api/cv-intelligence/test-auth`, { headers });
  console.log('📊 Auth test:', authTestResponse.status, '- User ID:', authTestResponse.data.user?.id);
  
  // Test 3: Database test endpoint
  console.log('🔍 Testing database connectivity...');
  const dbTestResponse = await axios.get(`${BASE_URL}/api/cv-intelligence/test-db`, { headers });
  console.log('📊 Database test:', dbTestResponse.status);
  console.log('- Database connected:', dbTestResponse.data.data?.database_connected);
  console.log('- CV Batches table exists:', dbTestResponse.data.data?.cv_batches_table_exists);
  console.log('- CV Candidates table exists:', dbTestResponse.data.data?.cv_candidates_table_exists);
  console.log('- User batches found:', dbTestResponse.data.data?.user_batches_count);
  
  // Test 4: Get batches endpoint
  console.log('🔍 Testing get batches endpoint...');
  const batchesResponse = await axios.get(`${BASE_URL}/api/cv-intelligence/batches`, { headers });
  console.log('📊 Batches endpoint:', batchesResponse.status, '- Batches found:', batchesResponse.data.data?.length || 0);
}

async function test4_CreateBatch() {
  if (!authToken) {
    throw new Error('No auth token available');
  }
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
  
  console.log('🔍 Testing create batch endpoint...');
  const createResponse = await axios.post(`${BASE_URL}/api/cv-intelligence`, {
    name: 'Test Batch - Verification Script'
  }, { headers });
  
  console.log('📊 Create batch:', createResponse.status);
  console.log('📊 Response structure:');
  console.log('- success:', createResponse.data.success);
  console.log('- batchId exists:', !!createResponse.data.data?.batchId);
  
  if (createResponse.data.data?.batchId) {
    console.log('✅ Batch created successfully with ID:', createResponse.data.data.batchId);
    return createResponse.data.data.batchId;
  } else {
    throw new Error('No batch ID returned');
  }
}

async function test5_EndToEndWorkflow() {
  console.log('🔍 Testing complete workflow...');
  
  // Step 1: Create a batch
  const batchId = await test4_CreateBatch();
  
  // Step 2: Verify batch was created by fetching batches again
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
  
  const batchesResponse = await axios.get(`${BASE_URL}/api/cv-intelligence/batches`, { headers });
  const batches = batchesResponse.data.data || [];
  const createdBatch = batches.find(b => b.id === batchId);
  
  if (createdBatch) {
    console.log('✅ Batch verification successful:');
    console.log('- Batch ID:', createdBatch.id);
    console.log('- Batch Name:', createdBatch.name);
    console.log('- Status:', createdBatch.status);
    console.log('- Created:', createdBatch.created_at);
  } else {
    throw new Error('Created batch not found in batches list');
  }
}

async function generateReport() {
  console.log('\n🎯 CV Intelligence Fix Verification Report');
  console.log('==========================================');
  
  const reportData = {
    timestamp: new Date().toISOString(),
    backend_url: BASE_URL,
    test_user: TEST_CREDENTIALS.email,
    token_obtained: !!authToken,
    token_preview: authToken ? authToken.substring(0, 30) + '...' : 'None'
  };
  
  console.log('📊 Test Summary:');
  console.log('- Backend URL:', reportData.backend_url);
  console.log('- Test User:', reportData.test_user);
  console.log('- Authentication:', reportData.token_obtained ? '✅ WORKING' : '❌ FAILED');
  console.log('- Timestamp:', reportData.timestamp);
  
  if (authToken) {
    console.log('\n🔑 Authentication Analysis:');
    try {
      const tokenParts = authToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('- JWT Format: ✅ Valid (3 parts)');
        console.log('- User ID Type:', typeof payload.userId);
        console.log('- Token Expiry:', new Date(payload.exp * 1000).toISOString());
        console.log('- Time Until Expiry:', Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60), 'minutes');
      }
    } catch (e) {
      console.log('- JWT Decode: ❌ Failed -', e.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting CV Intelligence Fix Verification');
  console.log('=============================================');
  console.log('This script will test all the fixes applied to resolve the routing issues.');
  
  // Run all tests
  await runTest('Basic Connectivity', test1_BasicConnectivity);
  await runTest('Authentication Flow', test2_AuthenticationFlow);
  await runTest('CV Intelligence Endpoints', test3_CVIntelligenceEndpoints);
  await runTest('Create Batch Functionality', test4_CreateBatch);
  await runTest('End-to-End Workflow', test5_EndToEndWorkflow);
  
  // Generate final report
  await generateReport();
  
  console.log('\n🏁 Verification Complete!');
  console.log('\nIf all tests passed, your CV Intelligence routing issues are resolved!');
  console.log('You can now:');
  console.log('1. Open your frontend CV Intelligence page');
  console.log('2. Login with your credentials');
  console.log('3. Create and process CV batches');
  console.log('\nDebug Tools Available:');
  console.log('- Browser Debug Tool: open /Users/syedarfan/Documents/ai_platform/debug-cv-intelligence.html');
  console.log('- Backend Test Endpoints:');
  console.log('  - GET /api/cv-intelligence/test (no auth)');
  console.log('  - GET /api/cv-intelligence/test-auth (with auth)');
  console.log('  - GET /api/cv-intelligence/test-db (with auth)');
}

// Run the verification
main().catch(error => {
  console.error('\n💥 Verification script failed:', error.message);
  process.exit(1);
});
