// Test payment verification endpoint
const baseUrl = 'https://black-box-production.up.railway.app';

async function testVerifyPayment() {
  console.log('Testing Payment Verification Endpoint...\n');
  
  try {
    const response = await fetch(`${baseUrl}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'VM-001'
      },
      body: JSON.stringify({
        qrCodeId: 'test-qr-id'
      })
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Payment verification working:', data);
    } else {
      console.log('❌ Payment verification failed');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testVerifyPayment();
