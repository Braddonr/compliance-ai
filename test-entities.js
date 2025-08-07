const https = require('https');

const BACKEND_URL = 'https://compliance-ai-80m0.onrender.com';

async function testEntities() {
  return new Promise((resolve, reject) => {
    const url = new URL('/database/test-entities', BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log('🧪 Testing entity creation...');
    console.log('URL:', `${BACKEND_URL}/database/test-entities`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`Status: ${res.statusCode}`);
          console.log('Response:', JSON.stringify(parsed, null, 2));
          
          if (parsed.success) {
            console.log('✅ Entity creation test passed!');
          } else {
            console.log('❌ Entity creation test failed:', parsed.error);
            if (parsed.stack) {
              console.log('Stack trace:', parsed.stack);
            }
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
  console.log('🧪 Testing Entity Creation');
  console.log('Backend URL:', BACKEND_URL);
  console.log('=' .repeat(50));

  try {
    await testEntities();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();