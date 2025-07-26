// Test the ultra-simple webhook
const baseUrl = 'https://black-box-production.up.railway.app';

async function testSimpleWebhook() {
  console.log('🧪 Testing ULTRA-SIMPLE Webhook...\n');
  
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
    console.log('📡 Testing: /razorpay-webhook');
    
    const response = await fetch(`${baseUrl}/razorpay-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'test_signature_123'
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    if (response.ok) {
      console.log('\n🎉 SUCCESS! Ultra-simple webhook is working!');
      console.log('\n✅ RAZORPAY WEBHOOK URL FOR YOUR DASHBOARD:');
      console.log('https://black-box-production.up.railway.app/razorpay-webhook');
      console.log('\n📋 Configure this URL in your Razorpay webhook settings');
      console.log('🎯 Events to select: qr_code.credited, payment.captured, payment.failed');
    } else {
      console.log('❌ Still not working. Checking deployment status...');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testSimpleWebhook();
