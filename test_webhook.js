// Test Razorpay Webhook Implementation
const baseUrl = 'https://black-box-production.up.railway.app';

async function testWebhook() {
  console.log('🧪 Testing Razorpay Webhook Implementation...\n');
  
  // Test 1: QR Code Payment Success
  console.log('1️⃣ Testing QR Code Payment Success Event...');
  
  const qrPaymentSuccessPayload = {
    "event": "qr_code.credited",
    "payload": {
      "qr_code": {
        "entity": {
          "id": "qr_test_123456",
          "notes": {
            "order_id": "BB1753493855391"  // Use a test order ID
          }
        }
      },
      "payment": {
        "entity": {
          "id": "pay_test_789012",
          "amount": 2500,  // ₹25.00 in paise
          "status": "captured"
        }
      }
    }
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'test_signature_123'
      },
      body: JSON.stringify(qrPaymentSuccessPayload)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ QR Payment Success webhook processed successfully!\n');
    } else {
      console.log('❌ QR Payment Success webhook failed\n');
    }
    
  } catch (error) {
    console.log('❌ Error testing QR payment webhook:', error.message, '\n');
  }
  
  // Test 2: Payment Failed Event
  console.log('2️⃣ Testing Payment Failed Event...');
  
  const paymentFailedPayload = {
    "event": "payment.failed",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test_failed_123",
          "notes": {
            "order_id": "BB1753493855391"
          },
          "status": "failed"
        }
      }
    }
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'test_signature_456'
      },
      body: JSON.stringify(paymentFailedPayload)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ Payment Failed webhook processed successfully!\n');
    } else {
      console.log('❌ Payment Failed webhook failed\n');
    }
    
  } catch (error) {
    console.log('❌ Error testing payment failed webhook:', error.message, '\n');
  }
  
  // Test 3: Regular Payment Captured
  console.log('3️⃣ Testing Regular Payment Captured Event...');
  
  const paymentCapturedPayload = {
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test_captured_789",
          "amount": 1000,  // ₹10.00 in paise
          "notes": {
            "order_id": "BB1753493855391"
          },
          "status": "captured"
        }
      }
    }
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'test_signature_789'
      },
      body: JSON.stringify(paymentCapturedPayload)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ Payment Captured webhook processed successfully!\n');
    } else {
      console.log('❌ Payment Captured webhook failed\n');
    }
    
  } catch (error) {
    console.log('❌ Error testing payment captured webhook:', error.message, '\n');
  }
  
  console.log('🎯 Webhook testing completed!');
  console.log('📋 Next steps:');
  console.log('1. Check Railway logs for webhook processing details');
  console.log('2. Verify database updates in Supabase');
  console.log('3. Test with real Razorpay webhook events');
}

testWebhook();
