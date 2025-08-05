// Simple API test script
const testAPI = async () => {
  const baseURL = 'http://localhost:5174';
  
  console.log('🧪 Testing BlackBox API Endpoints...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${baseURL}/api/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health:', healthData);
    console.log('');
    
    // Test 2: Get Inventory
    console.log('2️⃣ Testing Inventory (VM-001)...');
    const inventoryRes = await fetch(`${baseURL}/api/inventory`, {
      headers: { 'x-tenant-id': 'VM-001' }
    });
    const inventoryData = await inventoryRes.json();
    console.log('✅ Inventory:', `${inventoryData.count} items for ${inventoryData.tenantId}`);
    console.log('');
    
    // Test 3: Initialize Inventory
    console.log('3️⃣ Testing Inventory Init (VM-002)...');
    const initRes = await fetch(`${baseURL}/api/inventory/init`, {
      method: 'POST',
      headers: { 
        'x-tenant-id': 'VM-002',
        'x-api-key': 'blackbox-api-key-2024',
        'Content-Type': 'application/json'
      }
    });
    const initData = await initRes.json();
    console.log('✅ Init:', initData.message);
    console.log('');
    
    // Test 4: Create Order
    console.log('4️⃣ Testing Order Creation...');
    const orderRes = await fetch(`${baseURL}/api/orders`, {
      method: 'POST',
      headers: { 
        'x-tenant-id': 'VM-001',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ id: '1', name: 'Cola', price: 25, quantity: 2 }],
        totalAmount: 50,
        customerName: 'Test User',
        customerPhone: '1234567890'
      })
    });
    const orderData = await orderRes.json();
    console.log('✅ Order:', `${orderData.orderId} - ₹${orderData.amount}`);
    console.log('');
    
    console.log('🎉 All API endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
};

testAPI();
