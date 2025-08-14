const https = require('https');

const FRONTEND_URL = 'https://compliance-ai-1-3uf3.onrender.com';
const BACKEND_URL = 'https://compliance-ai-80m0.onrender.com';

async function testFrontend() {
  console.log('🌐 Testing Frontend Configuration');
  console.log('Frontend URL:', FRONTEND_URL);
  console.log('Expected Backend URL:', BACKEND_URL);
  console.log('=' .repeat(50));

  // Test if frontend is accessible
  return new Promise((resolve, reject) => {
    const url = new URL(FRONTEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; API-Test/1.0)',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Frontend Status: ${res.statusCode}`);
        
        // Check if the response contains the expected VITE_API_URL
        if (responseData.includes('compliance-ai-80m0.onrender.com')) {
          console.log('✅ Frontend appears to be configured with correct API URL');
        } else if (responseData.includes('VITE_API_URL')) {
          console.log('⚠️  Frontend has VITE_API_URL but might not match expected backend');
        } else {
          console.log('❓ Cannot determine API URL configuration from frontend');
        }
        
        // Check if it's a React app
        if (responseData.includes('react') || responseData.includes('React')) {
          console.log('✅ Frontend appears to be a React application');
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ Frontend test failed:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

testFrontend().catch(console.error);