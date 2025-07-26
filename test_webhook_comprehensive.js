// Comprehensive Razorpay Webhook Test
const baseUrl = 'https://black-box-production.up.railway.app';

async function testWebhookEndpoints() {
  console.log('🧪 COMPREHENSIVE RAZORPAY WEBHOOK TEST\n');
  
  const testPayload = {
    "event": "qr_code.credited",
    "payload": {
      "qr_code": {
        "entity": {
          "id": "qr_test_123456",
          "notes": {
            "order_id": "BB1753493855391"
          }
        }
      },
      "payment": {
        "entity": {
          "id": "pay_test_789012",
          "amount": 2500
        }
      }
    }
  };
  
  // Test 1: Direct webhook endpoint (bypasses middleware)
  console.log('1️⃣ Testing DIRECT webhook endpoint: /webhook/razorpay');
  await testEndpoint(`${baseUrl}/webhook/razorpay`, testPayload);
  
  // Test 2: API webhook endpoint (through middleware)
  console.log('\n2️⃣ Testing API webhook endpoint: /api/razorpay/webhook');
  await testEndpoint(`${baseUrl}/api/razorpay/webhook`, testPayload);
  
  // Test 3: Health check to verify deployment
  console.log('\n3️⃣ Testing health endpoint');
  await testHealthEndpoint();
  
  console.log('\n🎯 WEBHOOK TEST SUMMARY:');
  console.log('✅ If direct webhook works: Use /webhook/razorpay in Razorpay dashboard');
  console.log('✅ If API webhook works: Use /api/razorpay/webhook in Razorpay dashboard');
  console.log('📋 Next: Configure the working URL in your Razorpay webhook settings');
}

async function testEndpoint(url, payload) {
  try {
    console.log(`📡 Testing: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'test_signature_123'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${responseText}`);
    
    if (response.ok) {
      console.log('✅ SUCCESS - This endpoint is working!');
      return true;
    } else {
      console.log('❌ FAILED - This endpoint has issues');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testHealthEndpoint() {
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is healthy and deployed');
      console.log(`Timestamp: ${data.timestamp}`);
    } else {
      console.log('❌ Backend health check failed');
    }
    
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
  }
}

// Run the comprehensive test
testWebhookEndpoints();
