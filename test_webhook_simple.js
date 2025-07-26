// Simple webhook test
const baseUrl = 'https://black-box-production.up.railway.app';

async function testSimpleWebhook() {
  console.log('🧪 Testing Simple Webhook...\n');
  
  const payload = {
    "event": "qr_code.credited",
    "payload": {
      "qr_code": {
        "entity": {
          "id": "qr_test_123",
          "notes": {
            "order_id": "TEST_ORDER_123"
          }
        }
      },
      "payment": {
        "entity": {
          "id": "pay_test_456",
          "amount": 1000
        }
      }
    }
  };
  
  try {
    console.log('Sending webhook to:', `${baseUrl}/webhook/razorpay`);

    const response = await fetch(`${baseUrl}/webhook/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (response.ok) {
      console.log('✅ Webhook test SUCCESSFUL!');
    } else {
      console.log('❌ Webhook test FAILED');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testSimpleWebhook();
