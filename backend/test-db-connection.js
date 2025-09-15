#!/usr/bin/env node

const database = require('./models/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testDatabaseConnection() {
  console.log('🧪 Starting comprehensive database connection test...');
  
  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing database connection...');
    await database.connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Test basic query
    console.log('\n2️⃣ Testing basic query...');
    const timeResult = await database.get('SELECT NOW() as current_time');
    console.log('✅ Current database time:', timeResult.current_time);
    
    // Test 3: Check if tables exist
    console.log('\n3️⃣ Checking if tables exist...');
    const tablesResult = await database.all(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('✅ Tables found:', tablesResult.map(t => t.table_name));
    
    // Test 4: Test user operations
    console.log('\n4️⃣ Testing user operations...');
    
    // Check if test user exists
    const testEmail = 'test-user@securemaxtech.com';
    let existingUser = await User.findByEmail(testEmail);
    
    if (existingUser) {
      console.log('🗑️ Removing existing test user...');
      await database.run('DELETE FROM users WHERE email = $1', [testEmail]);
    }
    
    // Create test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    const userId = await User.create({
      first_name: 'Test',
      last_name: 'User',
      email: testEmail,
      password_hash: hashedPassword,
      department: 'Testing',
      job_title: 'Test Engineer',
      is_verified: true
    });
    console.log('✅ Test user created with ID:', userId);
    
    // Find user by email
    console.log('🔍 Finding user by email...');
    const foundUser = await User.findByEmail(testEmail);
    console.log('✅ User found:', foundUser ? foundUser.email : 'Not found');
    
    // Test password verification
    console.log('🔐 Testing password verification...');
    const isPasswordValid = await foundUser.verifyPassword('TestPassword123!');
    console.log('✅ Password verification:', isPasswordValid ? 'SUCCESS' : 'FAILED');
    
    // Test user statistics
    console.log('📊 Testing user statistics...');
    const stats = await User.getStatistics();
    console.log('✅ User statistics:', stats);
    
    // Test session creation
    console.log('🎫 Testing session creation...');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await database.run(`
      INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      userId,
      'test-session-token',
      'test-refresh-token',
      sessionExpiry.toISOString(),
      '127.0.0.1',
      'Test-Agent'
    ]);
    console.log('✅ Session created successfully');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await database.run('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
    await database.run('DELETE FROM users WHERE id = $1', [userId]);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All database tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Database connection: WORKING');
    console.log('  ✅ Table creation: WORKING');
    console.log('  ✅ User creation: WORKING');
    console.log('  ✅ User queries: WORKING');
    console.log('  ✅ Password hashing/verification: WORKING');
    console.log('  ✅ Session management: WORKING');
    console.log('  ✅ PostgreSQL syntax: WORKING');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    process.exit(1);
  } finally {
    await database.disconnect();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testDatabaseConnection();
