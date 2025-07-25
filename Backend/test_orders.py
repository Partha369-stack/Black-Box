import requests
import json

# Test the orders endpoint
url = "http://127.0.0.1:3005/api/orders"
headers = {
    "Content-Type": "application/json",
    "x-tenant-id": "VM-001", 
    "x-api-key": "blackbox-api-key-2024"
}

test_order = {
    "items": [
        {
            "id": "test-item-1",
            "name": "Test Product",
            "price": 10.99,
            "quantity": 1
        }
    ],
    "totalAmount": 10.99
}

try:
    print("🧪 Testing orders endpoint...")
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    print(f"Body: {json.dumps(test_order, indent=2)}")
    
    response = requests.post(url, headers=headers, json=test_order)
    
    print(f"\n📊 Response:")
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        print(f"✅ Success! Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"❌ Error Response: {response.text}")
        try:
            error_data = response.json()
            if 'error' in error_data:
                print(f"❌ Detailed Error: {error_data['error']}")
        except:
            pass
        
except Exception as e:
    print(f"❌ Exception occurred: {str(e)}")
