#!/usr/bin/env python3
"""
Test Razorpay API directly to ensure credentials work
"""
import requests
import json
from datetime import datetime

# Your Razorpay credentials
RAZORPAY_KEY_ID = "rzp_test_03GDDKe1yQVSCT"
RAZORPAY_KEY_SECRET = "g732gEWlZd8M0OB8DjGYCWns"

def test_razorpay_order_creation():
    """Test creating a Razorpay order"""
    print("🧪 Testing Razorpay Order Creation...")
    
    order_data = {
        'amount': 2500,  # ₹25 in paise
        'currency': 'INR',
        'receipt': 'test_order_123',
        'payment_capture': 1
    }
    
    try:
        response = requests.post(
            'https://api.razorpay.com/v1/orders',
            json=order_data,
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            timeout=10
        )
        
        print(f"📥 Order Response Status: {response.status_code}")
        print(f"📦 Order Response: {response.text}")
        
        if response.status_code == 200:
            order = response.json()
            print(f"✅ Order created successfully: {order['id']}")
            return order
        else:
            print(f"❌ Order creation failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Order creation error: {str(e)}")
        return None

def test_razorpay_qr_creation(order_id=None):
    """Test creating a Razorpay QR code"""
    print("\n🧪 Testing Razorpay QR Code Creation...")
    
    qr_data = {
        'type': 'upi_qr',
        'name': 'Test BlackBox Order',
        'usage': 'single_use',
        'fixed_amount': True,
        'payment_amount': 2500,  # ₹25 in paise
        'description': 'Test payment for BlackBox',
        'close_by': int(datetime.now().timestamp()) + 3600,  # 1 hour expiry
        'notes': {
            'order_id': 'test_order_123',
            'machine_id': 'VM-001',
            'test': 'true'
        }
    }
    
    try:
        response = requests.post(
            'https://api.razorpay.com/v1/payments/qr_codes',
            json=qr_data,
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            timeout=10
        )
        
        print(f"📥 QR Response Status: {response.status_code}")
        print(f"📦 QR Response: {response.text}")
        
        if response.status_code == 200:
            qr_code = response.json()
            print(f"✅ QR code created successfully: {qr_code['id']}")
            print(f"🎯 QR code image URL: {qr_code['image_url']}")
            return qr_code
        else:
            print(f"❌ QR creation failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ QR creation error: {str(e)}")
        return None

def main():
    print("🚀 Testing Razorpay API Integration...")
    print(f"🔑 Using Key ID: {RAZORPAY_KEY_ID}")
    print(f"🔐 Using Secret: {RAZORPAY_KEY_SECRET[:8]}...")
    
    # Test order creation
    order = test_razorpay_order_creation()
    
    # Test QR code creation
    qr_code = test_razorpay_qr_creation(order['id'] if order else None)
    
    print("\n📊 Test Results:")
    print(f"Order Creation: {'✅ SUCCESS' if order else '❌ FAILED'}")
    print(f"QR Code Creation: {'✅ SUCCESS' if qr_code else '❌ FAILED'}")
    
    if qr_code:
        print(f"\n🎯 QR Code URL: {qr_code['image_url']}")
        print("✅ Razorpay integration is working correctly!")
    else:
        print("\n❌ Razorpay integration has issues!")

if __name__ == "__main__":
    main()
