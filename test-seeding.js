const https = require('https');

const BACKEND_URL = 'https://compliance-ai-80m0.onrender.com';

async function testSeeding() {
  return new Promise((resolve, reject) => {
    const url = new URL('/database/seed', BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log('🌱 Triggering database seeding...');
    console.log('URL:', `${BACKEND_URL}/database/seed`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`Status: ${res.statusCode}`);
          console.log('Response:', parsed);
          
          if (parsed.success) {
            console.log('✅ Database seeding completed successfully!');
          } else {
            console.log('❌ Database seeding failed:', parsed.error);
          }
          
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          console.log(`Status: ${res.statusCode}`);
          console.log('Raw response:', responseData);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

async function testDatabaseHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL('/database/health', BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log('🏥 Testing database health...');

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`Status: ${res.statusCode}`);
          console.log('Response:', parsed);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          console.log(`Status: ${res.statusCode}`);
          console.log('Raw response:', responseData);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Database Operations');
  console.log('Backend URL:', BACKEND_URL);
  console.log('=' .repeat(50));

  try {
    // Test database health first
    await testDatabaseHealth();
    console.log('');
    
    // Then try seeding
    await testSeeding();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();