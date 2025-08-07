const https = require('https');

const BACKEND_URL = 'https://compliance-ai-80m0.onrender.com';

async function testSimpleSeeding() {
  return new Promise((resolve, reject) => {
    const url = new URL('/database/seed-simple', BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log('🌱 Triggering simple database seeding...');
    console.log('URL:', `${BACKEND_URL}/database/seed-simple`);

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
            console.log('✅ Simple database seeding completed successfully!');
          } else {
            console.log('❌ Simple database seeding failed:', parsed.error);
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

async function runTest() {
  console.log('🧪 Testing Simple Database Seeding');
  console.log('Backend URL:', BACKEND_URL);
  console.log('=' .repeat(50));

  try {
    await testSimpleSeeding();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();