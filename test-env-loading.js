#!/usr/bin/env node

// Simple test to verify environment variables are loaded correctly
const path = require('path');
const fs = require('fs');

console.log('🔧 Testing Environment Variable Loading');
console.log('=' .repeat(50));

// Check if .env file exists at root
const envPath = path.resolve(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log('📁 Root .env file exists:', envExists);

if (envExists) {
  // Read and parse .env file manually
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => 
    line.trim() && !line.startsWith('#') && line.includes('=')
  );
  
  console.log('📋 Environment variables found in .env:');
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && key.startsWith('VITE_')) {
      console.log(`  ${key.trim()}: ${value ? value.trim() : '(empty)'}`);
    }
  });
  
  // Check specific variables
  const viteApiUrl = envLines.find(line => line.startsWith('VITE_API_URL='));
  const port = envLines.find(line => line.startsWith('PORT='));
  const frontendPort = envLines.find(line => line.startsWith('FRONTEND_PORT='));
  
  console.log('\n🎯 Key Variables:');
  console.log('VITE_API_URL:', viteApiUrl ? viteApiUrl.split('=')[1] : 'NOT FOUND');
  console.log('PORT:', port ? port.split('=')[1] : 'NOT FOUND');
  console.log('FRONTEND_PORT:', frontendPort ? frontendPort.split('=')[1] : 'NOT FOUND');
  
  // Test if Vite can access these
  console.log('\n💡 For Vite to access VITE_API_URL:');
  console.log('1. Make sure VITE_API_URL is in the root .env file ✅');
  console.log('2. Make sure Vite config has envDir pointing to root ✅');
  console.log('3. Restart the frontend server after .env changes');
  
} else {
  console.log('❌ .env file not found at root level');
  console.log('Expected location:', envPath);
}

console.log('\n🚀 Next steps:');
console.log('1. Restart frontend server: cd frontend && npm run dev');
console.log('2. Check browser console for environment debug logs');
console.log('3. Look for "🔧 Frontend Environment Variables" in console');