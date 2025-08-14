#!/usr/bin/env node

/**
 * Railway Deployment Debug Script
 * Run this to check if all required environment variables are present
 */

console.log('🔍 Railway Deployment Debug Check');
console.log('=====================================');

const requiredEnvVars = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'OPENAI_API_KEY'
];

const optionalEnvVars = [
  'PORT',
  'FRONTEND_URL'
];

console.log('\n✅ Required Environment Variables:');
let missingRequired = [];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ${varName}: ${varName.includes('KEY') || varName.includes('SECRET') ? '***HIDDEN***' : value}`);
  } else {
    console.log(`  ${varName}: ❌ MISSING`);
    missingRequired.push(varName);
  }
});

console.log('\n🔧 Optional Environment Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`  ${varName}: ${value || 'Not set (using default)'}`);
});

console.log('\n🗄️ Database Connection Test:');
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`  Host: ${url.hostname}`);
    console.log(`  Port: ${url.port}`);
    console.log(`  Database: ${url.pathname.slice(1)}`);
    console.log(`  SSL: ${url.searchParams.get('sslmode') || 'default'}`);
  } catch (error) {
    console.log(`  ❌ Invalid DATABASE_URL format: ${error.message}`);
  }
} else {
  console.log('  ❌ DATABASE_URL not provided by Railway');
}

console.log('\n🚀 Startup Check:');
console.log(`  Node Version: ${process.version}`);
console.log(`  Platform: ${process.platform}`);
console.log(`  Working Directory: ${process.cwd()}`);

if (missingRequired.length > 0) {
  console.log('\n❌ DEPLOYMENT WILL FAIL');
  console.log('Missing required environment variables:');
  missingRequired.forEach(varName => {
    console.log(`  - ${varName}`);
  });
  console.log('\nAdd these variables in Railway dashboard before deploying.');
  process.exit(1);
} else {
  console.log('\n✅ ALL REQUIRED VARIABLES PRESENT');
  console.log('Deployment should succeed!');
}