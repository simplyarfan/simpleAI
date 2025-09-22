#!/usr/bin/env node

/**
 * OpenRouter API Key Test Script
 * Tests if your API key is working properly
 */

const axios = require('axios');

async function testOpenRouterAPI() {
  console.log('🧪 Testing OpenRouter API Key...');
  console.log('=====================================');
  
  // These are the possible environment variable names
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || process.env.API_KEY;
  
  console.log('🔍 Environment Variables Check:');
  console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET');
  console.log('- OPENROUTER_KEY:', process.env.OPENROUTER_KEY ? 'SET' : 'NOT SET');  
  console.log('- API_KEY:', process.env.API_KEY ? 'SET' : 'NOT SET');
  console.log('- Final key found:', apiKey ? 'YES' : 'NO');
  
  if (!apiKey) {
    console.log('❌ NO API KEY FOUND!');
    console.log('📝 Add OPENROUTER_API_KEY to your environment variables');
    return;
  }
  
  console.log('🔑 API Key preview:', apiKey.substring(0, 15) + '...');
  
  try {
    console.log('\n🚀 Testing API call...');
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "API test successful" if you can read this.' }
      ],
      temperature: 0.3,
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://thesimpleai.vercel.app',
        'X-Title': 'SimpleAI CV Intelligence Test'
      },
      timeout: 30000
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.choices && response.data.choices[0]) {
      const message = response.data.choices[0].message.content;
      console.log('🎉 AI Response:', message);
      
      if (message.toLowerCase().includes('successful')) {
        console.log('\n🎯 OPENROUTER API IS WORKING PERFECTLY!');
        console.log('✅ Your CV Intelligence should now work with full AI analysis');
      } else {
        console.log('\n⚠️  API working but unexpected response');
      }
    }
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error('- Status:', error.response?.status);
    console.error('- Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔑 SOLUTION: Your API key is invalid or expired');
      console.log('1. Go to https://openrouter.ai/');
      console.log('2. Generate a new API key');
      console.log('3. Update OPENROUTER_API_KEY in Vercel environment variables');
    } else if (error.response?.status === 429) {
      console.log('\n⏱️  SOLUTION: Rate limit exceeded');
      console.log('Wait a moment and try again');
    } else {
      console.log('\n🔧 SOLUTION: Check your API key and network connection');
    }
  }
}

// Run the test
testOpenRouterAPI().catch(console.error);
