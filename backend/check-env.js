#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 Checking environment variables...\n');

const requiredVars = [
  'POSTGRES_URL',
  'DATABASE_URL', 
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'COMPANY_DOMAIN',
  'ADMIN_EMAIL'
];

const optionalVars = [
  'NODE_ENV',
  'PORT',
  'FRONTEND_URL',
  'JWT_EXPIRES_IN'
];

let allGood = true;

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = varName.includes('SECRET') || varName.includes('URL') ? 
    (value ? '[SET]' : '[NOT SET]') : 
    (value || '[NOT SET]');
  
  console.log(`  ${status} ${varName}: ${displayValue}`);
  
  if (!value) {
    allGood = false;
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const displayValue = varName.includes('SECRET') || varName.includes('URL') ? 
    (value ? '[SET]' : '[NOT SET]') : 
    (value || '[NOT SET]');
  
  console.log(`  ${status} ${varName}: ${displayValue}`);
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 All required environment variables are set!');
  console.log('✅ Ready to test database connection');
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('📝 Please add them to your .env file before proceeding');
}

console.log('\n💡 Next steps:');
console.log('1. Add missing variables to your .env file');
console.log('2. Run: node test-db-connection.js');
console.log('3. If successful, start your server: npm start');
