const https = require('https');

const BACKEND_URL = 'https://compliance-ai-80m0.onrender.com';

async function testStep(stepNumber, stepName) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/database/test-step${stepNumber}`, BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log(`🧪 Testing Step ${stepNumber}: ${stepName}...`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`   Status: ${res.statusCode}`);
          
          if (parsed.success) {
            console.log(`   ✅ Step ${stepNumber} (${stepName}) PASSED`);
            console.log(`   Data:`, JSON.stringify(parsed.data, null, 4));
          } else {
            console.log(`   ❌ Step ${stepNumber} (${stepName}) FAILED`);
            console.log(`   Error:`, parsed.error);
            if (parsed.stack) {
              console.log(`   Stack:`, parsed.stack);
            }
          }
          
          resolve({ step: stepNumber, success: parsed.success, data: parsed });
        } catch (e) {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Raw response:`, responseData);
          resolve({ step: stepNumber, success: false, data: responseData });
        }
        console.log(''); // Add spacing between steps
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Request failed:`, error.message);
      reject(error);
    });
    
    req.end();
  });
}

async function runStepByStepTests() {
  console.log('🧪 Running Step-by-Step Database Tests');
  console.log('Backend URL:', BACKEND_URL);
  console.log('=' .repeat(60));

  const steps = [
    { number: 1, name: 'Organization Creation' },
    { number: 2, name: 'Framework Creation' },
    { number: 3, name: 'User Creation' },
    { number: 4, name: 'ComplianceProgress Creation' },
    { number: 5, name: 'Tasks Setup' },
    { number: 6, name: 'Documents Setup' },
  ];

  const results = [];

  for (const step of steps) {
    try {
      const result = await testStep(step.number, step.name);
      results.push(result);
      
      // If a step fails, stop testing subsequent steps
      if (!result.success) {
        console.log(`🛑 Stopping tests - Step ${step.number} failed`);
        break;
      }
    } catch (error) {
      console.error(`❌ Step ${step.number} test failed:`, error);
      break;
    }
  }

  console.log('📊 Test Summary:');
  console.log('=' .repeat(60));
  
  for (const result of results) {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`Step ${result.step}: ${status}`);
  }

  const passedSteps = results.filter(r => r.success).length;
  const totalSteps = results.length;
  
  console.log(`\n🎯 Results: ${passedSteps}/${totalSteps} steps passed`);
  
  if (passedSteps === totalSteps && totalSteps === steps.length) {
    console.log('🎉 All basic steps passed! The issue is likely in complex relationships (ComplianceProgress, Tasks, or Documents)');
  } else {
    console.log(`🔍 Issue identified at Step ${results.find(r => !r.success)?.step || 'Unknown'}`);
  }
}

runStepByStepTests().catch(console.error);