// Test QR code generation
const fetch = require('node-fetch');

async function testQRGeneration() {
  console.log('🧪 Testing QR Code Generation...\n');
  
  const testOrder = {
    items: [{ id: '1', name: 'Test Product', price: 10, quantity: 1 }],
    totalAmount: 10,
    customerName: 'Test Customer',
    customerPhone: '1234567890'
  };
  
  try {
    console.log('Creating order to test QR generation...');
    
    const response = await fetch('https://black-box-production.up.railway.app/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'VM-001'
      },
      body: JSON.stringify(testOrder)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n🎯 QR Code Analysis:');
      console.log('QR Code URL:', data.qrCodeUrl);
      console.log('QR Code ID:', data.qrCodeId);
      console.log('Razorpay Order ID:', data.razorpayOrderId);
      
      // Check if it's a real Razorpay QR or placeholder
      if (data.qrCodeUrl && data.qrCodeUrl.includes('razorpay')) {
        console.log('✅ Real Razorpay QR code generated!');
      } else if (data.qrCodeUrl && data.qrCodeUrl.includes('qrserver.com')) {
        console.log('⚠️ Placeholder QR code - Razorpay API might have failed');
      } else {
        console.log('❓ Unknown QR code type');
      }
      
    } else {
      console.log('❌ Order creation failed');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testQRGeneration();
