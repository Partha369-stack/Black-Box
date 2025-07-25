#!/usr/bin/env python3
"""
Quick test script to verify backend functionality
Run this to test if the backend API endpoints are working properly
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:3005"  # Adjust if your backend runs on a different port
HEADERS = {
    "Content-Type": "application/json",
    "X-Tenant-ID": "VM-001",
    "x-api-key": "blackbox-api-key-2024"
}

def test_health_check():
    """Test health endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server. Make sure it's running.")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_inventory():
    """Test inventory endpoint"""
    print("Testing inventory...")
    try:
        response = requests.get(f"{BASE_URL}/api/inventory", headers=HEADERS)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Inventory retrieved successfully. Found {len(data.get('inventory', []))} items")
            return True
        else:
            print(f"❌ Inventory test failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Inventory test error: {e}")
        return False

def test_order_creation():
    """Test order creation"""
    print("Testing order creation...")
    try:
        order_data = {
            "items": [
                {
                    "id": "test-item-1",
                    "name": "Test Snack",
                    "price": 10.50,
                    "quantity": 2
                }
            ],
            "totalAmount": 21.00,
            "customerName": "Test Customer",
            "customerPhone": "1234567890"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", 
                               headers=HEADERS, 
                               json=order_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('orderId'):
                print(f"✅ Order created successfully! Order ID: {data['orderId']}")
                print(f"   QR Code URL: {data.get('qrCodeUrl', 'N/A')}")
                return data['orderId']
            else:
                print(f"❌ Order creation failed: {data}")
                return None
        else:
            print(f"❌ Order creation failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Order creation error: {e}")
        return None

def test_payment_verification():
    """Test payment verification endpoint"""
    print("Testing payment verification...")
    try:
        verification_data = {
            "qrCodeId": "test-qr-code-id"
        }
        
        response = requests.post(f"{BASE_URL}/api/verify-payment", 
                               headers=HEADERS, 
                               json=verification_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Payment verification endpoint working. Result: {data.get('success', False)}")
            return True
        else:
            print(f"❌ Payment verification failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Payment verification error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting backend API tests...\n")
    
    # Test health check first
    if not test_health_check():
        print("\n❌ Backend server is not responding. Please start the server first.")
        return
    
    print()
    
    # Test inventory
    test_inventory()
    print()
    
    # Test order creation
    order_id = test_order_creation()
    print()
    
    # Test payment verification
    test_payment_verification()
    print()
    
    print("🏁 Backend API tests completed!")
    
    if order_id:
        print(f"\n💡 Test order created with ID: {order_id}")
        print("   You can check this in your admin panel or orders API.")

if __name__ == "__main__":
    main()
