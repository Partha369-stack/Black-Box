// Test webhook with tenant ID header (temporary workaround)
const baseUrl = 'https://black-box-production.up.railway.app';

async function testWebhookWithTenant() {
  console.log('🧪 Testing Webhook with Tenant ID Header...\n');
  
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
    console.log('📡 Testing API webhook with tenant ID header...');
    
    const response = await fetch(`${baseUrl}/api/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'test_signature_123',
        'x-tenant-id': 'VM-001'  // Add tenant ID to bypass middleware
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    if (response.ok) {
      console.log('✅ SUCCESS! Webhook is working with tenant ID header!');
      console.log('\n🎯 SOLUTION: Configure Razorpay webhook with custom headers:');
      console.log('URL: https://black-box-production.up.railway.app/api/razorpay/webhook');
      console.log('Custom Header: x-tenant-id: VM-001');
    } else {
      console.log('❌ Still not working. Need to fix middleware exclusion.');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testWebhookWithTenant();
