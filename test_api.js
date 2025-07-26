// Test Railway API endpoints
const baseUrl = 'https://black-box-production.up.railway.app';

async function testAPI() {
  console.log('Testing Railway Backend API...\n');
  
  // Test 1: Health Check
  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
  
  // Test 2: Orders Endpoint
  try {
    const ordersRes = await fetch(`${baseUrl}/api/orders`, {
      headers: {
        'X-Tenant-ID': 'VM-001'
      }
    });
    const ordersData = await ordersRes.json();
    console.log('✅ Orders API:', ordersData);
  } catch (error) {
    console.log('❌ Orders API Failed:', error.message);
  }
  
  // Test 3: Initialize Orders
  try {
    const initRes = await fetch(`${baseUrl}/api/orders/init`, {
      headers: {
        'X-Tenant-ID': 'VM-001'
      }
    });
    const initData = await initRes.json();
    console.log('✅ Orders Init:', initData);
  } catch (error) {
    console.log('❌ Orders Init Failed:', error.message);
  }
  
  // Test 4: Machine Status
  try {
    const statusRes = await fetch(`${baseUrl}/api/machine/status`, {
      headers: {
        'X-Tenant-ID': 'VM-001'
      }
    });
    const statusData = await statusRes.json();
    console.log('✅ Machine Status:', statusData);
  } catch (error) {
    console.log('❌ Machine Status Failed:', error.message);
  }
}

testAPI();
