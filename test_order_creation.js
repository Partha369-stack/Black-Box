// Test order creation to check for recursion issues
const baseUrl = 'https://black-box-production.up.railway.app';

async function testOrderCreation() {
  console.log('Testing Order Creation...\n');
  
  const testOrder = {
    items: [
      {
        id: '1',
        name: 'Test Product',
        price: 25,
        quantity: 1
      }
    ],
    totalAmount: 25,
    customerName: 'Test Customer',
    customerPhone: '1234567890'
  };
  
  try {
    console.log('Creating test order...');
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'VM-001'
      },
      body: JSON.stringify(testOrder)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Order created successfully:', data);
    } else {
      console.log('❌ Order creation failed');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testOrderCreation();
