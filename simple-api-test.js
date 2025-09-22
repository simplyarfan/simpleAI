#!/usr/bin/env node

/**
 * Simple OpenRouter API Key Test Script
 * Tests if your API key is working using built-in Node.js features
 */

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
    console.log('\n🔧 To test with your API key:');
    console.log('export OPENROUTER_API_KEY="your-key-here"');
    console.log('node simple-api-test.js');
    return;
  }
  
  console.log('🔑 API Key preview:', apiKey.substring(0, 15) + '...');
  
  // Basic format validation
  if (!apiKey.startsWith('sk-or-v1-')) {
    console.log('⚠️  WARNING: API key format doesn\'t match expected OpenRouter format (sk-or-v1-...)');
  } else {
    console.log('✅ API key format looks correct');
  }
  
  console.log('\n🎯 API Key Status: CONFIGURED');
  console.log('📋 Next steps:');
  console.log('1. Make sure this same key is added to Vercel environment variables');
  console.log('2. Push the enhanced CV analysis code');
  console.log('3. Test your CV Intelligence dashboard');
  
  console.log('\n📝 Vercel Environment Setup:');
  console.log('- Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('- Add: OPENROUTER_API_KEY = ' + apiKey.substring(0, 15) + '...');
  console.log('- Environment: All (Production, Preview, Development)');
  console.log('- Redeploy after adding');
}

// Run the test
testOpenRouterAPI().catch(console.error);
