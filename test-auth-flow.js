#!/usr/bin/env node

/**
 * Test JWT Token Flow
 * Quick test to verify authentication and token format
 */

const axios = require('axios');

const BASE_URL = 'https://thesimpleai.vercel.app';

async function testAuthFlow() {
  console.log('🔐 Testing Authentication Flow');
  console.log('===============================');
  
  try {
    // Test 1: Login and get token
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'syedarfan@securemaxtech.com',
      password: 'admin123'
    });
    
    console.log('✅ Login response structure:');
    console.log('- success:', loginResponse.data.success);
    console.log('- token exists:', !!loginResponse.data.token);
    console.log('- refreshToken exists:', !!loginResponse.data.refreshToken);
    console.log('- user exists:', !!loginResponse.data.user);
    
    if (loginResponse.data.token) {
      console.log('- token preview:', loginResponse.data.token.substring(0, 20) + '...');
    }
    
    // Test 2: Use token to access CV Intelligence
    if (loginResponse.data.token) {
      console.log('\n2. Testing CV Intelligence routes with token...');
      
      const headers = {
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json'
      };
      
      // Test batches endpoint
      try {
        const batchesResponse = await axios.get(`${BASE_URL}/api/cv-intelligence/batches`, { headers });
        console.log('✅ Batches endpoint:', batchesResponse.status, '- Success!');
        console.log('- Data:', JSON.stringify(batchesResponse.data, null, 2).substring(0, 200) + '...');
      } catch (error) {
        console.log('❌ Batches endpoint failed:', error.response?.status, '-', error.response?.data?.message || error.message);
        if (error.response?.data?.debug) {
          console.log('- Debug info:', error.response.data.debug);
        }
      }
      
      // Test create batch
      try {
        const createResponse = await axios.post(`${BASE_URL}/api/cv-intelligence`, { name: 'Test Batch' }, { headers });
        console.log('✅ Create batch endpoint:', createResponse.status, '- Success!');
        console.log('- Data:', JSON.stringify(createResponse.data, null, 2).substring(0, 200) + '...');
      } catch (error) {
        console.log('❌ Create batch endpoint failed:', error.response?.status, '-', error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n🏁 Authentication test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuthFlow().catch(console.error);
