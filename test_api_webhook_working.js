// Test API webhook with tenant ID - WORKING SOLUTION
const baseUrl = 'https://black-box-production.up.railway.app';

async function testWorkingWebhook() {
  console.log('🎯 Testing WORKING API Webhook Solution...\n');
  
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
  
  try {
    console.log('📡 Testing: /api/razorpay/webhook with tenant ID header');
    
    const response = await fetch(`${baseUrl}/api/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'test_signature_123',
        'x-tenant-id': 'VM-001'  // This bypasses the middleware
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    if (response.ok) {
      console.log('\n🎉 SUCCESS! API Webhook is working!');
      console.log('\n✅ IMMEDIATE SOLUTION FOR RAZORPAY DASHBOARD:');
      console.log('URL: https://black-box-production.up.railway.app/api/razorpay/webhook');
      console.log('Custom Headers: x-tenant-id: VM-001');
      console.log('\n📋 In Razorpay Dashboard:');
      console.log('1. Add webhook URL above');
      console.log('2. Add custom header: x-tenant-id with value VM-001');
      console.log('3. Select events: qr_code.credited, payment.captured, payment.failed');
      console.log('\n🎯 This will work immediately!');
    } else {
      console.log('❌ Still not working. Response:', responseText);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testWorkingWebhook();
