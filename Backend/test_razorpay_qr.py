#!/usr/bin/env python3
"""
Comprehensive Razorpay QR Code Generation Test
Simulates the exact process that happens in your Railway backend
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')

def test_order_creation():
    """Test Razorpay order creation (first step)"""
    print("🚀 Testing Razorpay Order Creation...")
    
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        print("❌ Razorpay credentials missing")
        return None
    
    # Generate a test order ID
    test_order_id = f"BB{int(datetime.now().timestamp() * 1000)}"
    
    # Create order data (similar to your backend)
    order_data = {
        'amount': 2500,  # ₹25 in paise
        'currency': 'INR',
        'receipt': test_order_id,
        'payment_capture': 1
    }
    
    try:
        print(f"📤 Creating Razorpay order: {order_data}")
        
        response = requests.post(
            'https://api.razorpay.com/v1/orders',
            json=order_data,
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            timeout=30
        )
        
        print(f"📥 Response Status: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            order_result = response.json()
            print(f"✅ Order created successfully!")
            print(f"   Order ID: {order_result['id']}")
            print(f"   Amount: ₹{order_result['amount']/100}")
            print(f"   Status: {order_result['status']}")
            return order_result
        else:
            print(f"❌ Order creation failed:")
            print(f"   Error: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return None
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return None

def test_qr_code_creation(order_id=None):
    """Test QR code creation (second step)"""
    print("\n🎯 Testing QR Code Creation...")
    
    # Generate test data
    test_order_id = f"BB{int(datetime.now().timestamp() * 1000)}"
    
    qr_data = {
        'type': 'upi_qr',
        'name': f'BlackBox Order {test_order_id}',
        'usage': 'single_use',
        'fixed_amount': True,
        'payment_amount': 2500,  # ₹25 in paise
        'description': f'Payment for BlackBox order {test_order_id}',
        'close_by': int(datetime.now().timestamp()) + 3600,  # 1 hour expiry
        'notes': {
            'order_id': test_order_id,
            'machine_id': 'VM-001',
            'customer_name': 'Test Customer',
            'customer_phone': 'Test Phone',
            'test': 'true'
        }
    }
    
    try:
        print(f"📤 Creating QR code with data:")
        print(json.dumps(qr_data, indent=2))
        
        response = requests.post(
            'https://api.razorpay.com/v1/payments/qr_codes',
            json=qr_data,
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            timeout=30
        )
        
        print(f"📥 QR Response Status: {response.status_code}")
        print(f"📥 QR Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            qr_result = response.json()
            print(f"✅ QR Code created successfully!")
            print(f"   QR Code ID: {qr_result['id']}")
            print(f"   QR Code URL: {qr_result['image_url']}")
            print(f"   Status: {qr_result['status']}")
            print(f"   Amount: ₹{qr_result['payment_amount']/100}")
            
            # Validate QR URL
            qr_url = qr_result['image_url']
            if 'rzp.io' in qr_url or 'razorpay' in qr_url:
                print("✅ QR URL is valid Razorpay URL")
            else:
                print(f"⚠️ Unexpected QR URL format: {qr_url}")
                
            return qr_result
        else:
            print(f"❌ QR Code creation failed:")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {response.text}")
            
            # Try to parse error details
            try:
                error_data = response.json()
                if 'error' in error_data:
                    print(f"   Error Code: {error_data['error'].get('code')}")
                    print(f"   Error Description: {error_data['error'].get('description')}")
            except:
                pass
                
            return None
            
    except requests.exceptions.Timeout:
        print("❌ QR Code request timed out")
        return None
    except Exception as e:
        print(f"❌ QR Code exception: {str(e)}")
        return None

def test_full_flow():
    """Test the complete order + QR flow"""
    print("🔄 Testing Complete Order + QR Flow...")
    
    # Step 1: Create order
    order = test_order_creation()
    if not order:
        print("❌ Cannot proceed without successful order creation")
        return False
    
    # Step 2: Create QR code
    qr_code = test_qr_code_creation(order['id'])
    if not qr_code:
        print("❌ QR code creation failed")
        return False
    
    print("\n✅ Full flow completed successfully!")
    print("🎉 Your Razorpay integration should work properly")
    return True

def test_api_limits():
    """Test for API rate limits or restrictions"""
    print("\n⏱️ Testing API Rate Limits...")
    
    try:
        # Make multiple rapid requests to check for rate limiting
        for i in range(3):
            response = requests.get(
                'https://api.razorpay.com/v1/orders',
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
                timeout=10
            )
            print(f"Request {i+1}: Status {response.status_code}")
            
            if response.status_code == 429:
                print("⚠️ Rate limiting detected")
                break
        
        print("✅ No immediate rate limiting issues")
        
    except Exception as e:
        print(f"❌ Rate limit test failed: {str(e)}")

def main():
    print("🧪 RAZORPAY API COMPREHENSIVE TEST")
    print("=" * 50)
    print(f"🔑 Key ID: {RAZORPAY_KEY_ID[:8]}..." if RAZORPAY_KEY_ID else "❌ No Key ID")
    print(f"🔐 Secret: {'SET' if RAZORPAY_KEY_SECRET else 'NOT SET'}")
    print()
    
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        print("❌ Cannot proceed without Razorpay credentials")
        return
    
    # Run all tests
    test_api_limits()
    success = test_full_flow()
    
    print("\n" + "=" * 50)
    if success:
        print("🎯 RESULT: Your Razorpay API is working correctly!")
        print("💡 The issue might be in your Railway deployment environment or network.")
        print("🔍 Check Railway logs for specific error details.")
    else:
        print("❌ RESULT: There are issues with your Razorpay API.")
        print("💡 Check your credentials and account status.")
        
    print("\n🔗 Next steps:")
    print("1. If this test passes but Railway fails, check Railway environment variables")
    print("2. Check Railway logs for specific error messages")
    print("3. Ensure Railway has internet access to Razorpay APIs")
    print("4. Consider adding more error logging to your backend code")

if __name__ == "__main__":
    main()
