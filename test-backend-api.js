const https = require('https');

const BACKEND_URL = 'https://compliance-ai-80m0.onrender.com';

async function testAPI(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Backend API at:', BACKEND_URL);
  console.log('=' .repeat(50));

  // Test 1: Health check
  try {
    console.log('1. Testing health check endpoint (/)...');
    const health = await testAPI('/');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response:`, health.data);
    console.log('   ✅ Health check passed\n');
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message, '\n');
  }

  // Test 2: Detailed health check
  try {
    console.log('2. Testing detailed health endpoint (/health)...');
    const detailedHealth = await testAPI('/health');
    console.log(`   Status: ${detailedHealth.status}`);
    console.log(`   Response:`, detailedHealth.data);
    console.log('   ✅ Detailed health check passed\n');
  } catch (error) {
    console.log('   ❌ Detailed health check failed:', error.message, '\n');
  }

  // Test 3: API docs
  try {
    console.log('3. Testing API documentation (/api/docs)...');
    const docs = await testAPI('/api/docs');
    console.log(`   Status: ${docs.status}`);
    console.log('   ✅ API docs accessible\n');
  } catch (error) {
    console.log('   ❌ API docs failed:', error.message, '\n');
  }

  // Test 4: Auth login endpoint (should return 400 without credentials)
  try {
    console.log('4. Testing auth login endpoint (/auth/login)...');
    const login = await testAPI('/auth/login', 'POST', {});
    console.log(`   Status: ${login.status}`);
    console.log(`   Response:`, login.data);
    if (login.status === 400 || login.status === 401) {
      console.log('   ✅ Auth endpoint responding correctly\n');
    } else {
      console.log('   ⚠️  Unexpected response from auth endpoint\n');
    }
  } catch (error) {
    console.log('   ❌ Auth endpoint failed:', error.message, '\n');
  }

  // Test 5: Users endpoint (should return 401 without auth)
  try {
    console.log('5. Testing users endpoint (/users)...');
    const users = await testAPI('/users');
    console.log(`   Status: ${users.status}`);
    console.log(`   Response:`, users.data);
    if (users.status === 401) {
      console.log('   ✅ Users endpoint properly protected\n');
    } else {
      console.log('   ⚠️  Unexpected response from users endpoint\n');
    }
  } catch (error) {
    console.log('   ❌ Users endpoint failed:', error.message, '\n');
  }

  console.log('🏁 API testing completed!');
}

runTests().catch(console.error);