#!/usr/bin/env python3
"""
Test Razorpay Integration on Railway Deployment
This script will test your Railway-deployed backend to verify Razorpay functionality
"""

import requests
import json
import time
from datetime import datetime

# Railway deployment URL - update this with your actual Railway URL
RAILWAY_URL = "https://black-box-production.up.railway.app"  # Update this!

def test_railway_health():
    """Test if Railway deployment is accessible"""
    print("🔍 Testing Railway deployment health...")
    
    try:
        response = requests.get(f"{RAILWAY_URL}/api/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Railway deployment is healthy")
            print(f"   Status: {data.get('status')}")
            print(f"   Timestamp: {data.get('timestamp')}")
            return True
        else:
            print(f"❌ Railway health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Railway deployment")
        print("💡 Make sure your Railway URL is correct and the service is running")
        return False
    except Exception as e:
        print(f"❌ Railway health check error: {str(e)}")
        return False

def test_railway_razorpay():
    """Test Razorpay functionality on Railway"""
    print("\n🧪 Testing Razorpay integration on Railway...")
    
    try:
        response = requests.get(f"{RAILWAY_URL}/api/railway/test-razorpay", timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ Railway Razorpay test completed successfully!")
            print(f"🌍 Environment: {data.get('environment')}")
            print(f"🔑 Key ID Available: {data.get('key_id_available')}")
            print(f"🔐 Key Secret Available: {data.get('key_secret_available')}")
            print(f"🎯 Key ID Prefix: {data.get('key_id_prefix')}")
            
            # Test results
            tests = data.get('tests', {})
            print(f"\n📊 Test Results:")
            for test_name, result in tests.items():
                status_emoji = "✅" if "PASSED" in result else "❌"
                print(f"   {status_emoji} {test_name}: {result}")
            
            # Additional info
            if data.get('test_order_id'):
                print(f"🛍️ Test Order ID: {data.get('test_order_id')}")
            
            if data.get('test_qr_id'):
                print(f"🎯 Test QR Code ID: {data.get('test_qr_id')}")
                print(f"🔗 Test QR Code URL: {data.get('test_qr_url')}")
            
            if data.get('overall_status') == 'ALL_TESTS_PASSED':
                print("\n🎉 EXCELLENT! All Razorpay tests passed on Railway!")
                print("💡 Your Razorpay integration should work properly in production")
            else:
                print(f"\n⚠️ Some tests failed. Overall status: {data.get('overall_status', 'UNKNOWN')}")
                
            print(f"\n💡 Recommendation: {data.get('recommendation')}")
            
            return data.get('overall_status') == 'ALL_TESTS_PASSED'
            
        else:
            print(f"❌ Railway Razorpay test failed with status {response.status_code}")
            
            try:
                error_data = response.json()
                print(f"📄 Error Details:")
                print(json.dumps(error_data, indent=2))
                
                if error_data.get('error'):
                    print(f"🔍 Main Error: {error_data['error']}")
                    
                if error_data.get('recommendation'):
                    print(f"💡 Recommendation: {error_data['recommendation']}")
                    
            except:
                print(f"📄 Raw Response: {response.text}")
            
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - Railway might be slow or unresponsive")
        return False
    except Exception as e:
        print(f"❌ Railway Razorpay test error: {str(e)}")
        return False

def test_debug_endpoint():
    """Test the debug endpoint for additional info"""
    print("\n🔍 Testing debug endpoint...")
    
    try:
        response = requests.get(f"{RAILWAY_URL}/debug/razorpay", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Debug endpoint accessible")
            print(f"   Razorpay Key ID Set: {data.get('razorpay_key_id_set')}")
            print(f"   Razorpay Secret Set: {data.get('razorpay_secret_set')}")
            print(f"   Environment: {data.get('environment')}")
            return True
        else:
            print(f"❌ Debug endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Debug endpoint error: {str(e)}")
        return False

def test_order_creation():
    """Test actual order creation (requires tenant ID)"""
    print("\n🛍️ Testing order creation...")
    
    headers = {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'VM-001',  # Using default tenant
    }
    
    order_data = {
        "items": [
            {
                "id": "test-item-1",
                "name": "Railway Test Item",
                "price": 25.00,
                "quantity": 1
            }
        ],
        "totalAmount": 25.00,
        "customerName": "Railway Test Customer",
        "customerPhone": "1234567890"
    }
    
    try:
        response = requests.post(
            f"{RAILWAY_URL}/api/orders",
            headers=headers,
            json=order_data,
            timeout=30
        )
        
        print(f"📥 Order Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                print("✅ Order creation successful!")
                print(f"🆔 Order ID: {data.get('orderId')}")
                print(f"🎯 QR Code URL: {data.get('qrCodeUrl')}")
                print(f"🔗 QR Code ID: {data.get('qrCodeId')}")
                return True
            else:
                print(f"❌ Order creation failed: {data.get('error')}")
                return False
        else:
            print(f"❌ Order creation request failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📄 Error: {error_data.get('error')}")
            except:
                print(f"📄 Raw Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Order creation test error: {str(e)}")
        return False

def main():
    """Run all Railway tests"""
    print("🚀 RAILWAY RAZORPAY INTEGRATION TEST")
    print("=" * 50)
    
    # Ask user for Railway URL
    global RAILWAY_URL
    user_url = input(f"Enter your Railway URL (or press Enter for default: {RAILWAY_URL}): ").strip()
    if user_url:
        RAILWAY_URL = user_url.rstrip('/')
    
    print(f"🔗 Testing Railway deployment: {RAILWAY_URL}")
    print()
    
    # Run tests
    health_ok = test_railway_health()
    
    if not health_ok:
        print("\n❌ Cannot proceed - Railway deployment is not accessible")
        print("💡 Please check:")
        print("   1. Your Railway URL is correct")
        print("   2. Your Railway service is deployed and running")
        print("   3. Your internet connection is working")
        return
    
    debug_ok = test_debug_endpoint()
    razorpay_ok = test_railway_razorpay()
    
    print("\n" + "=" * 50)
    print("📊 FINAL RESULTS")
    print("=" * 50)
    
    print(f"🏥 Railway Health: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"🔍 Debug Endpoint: {'✅ PASS' if debug_ok else '❌ FAIL'}")
    print(f"💳 Razorpay Integration: {'✅ PASS' if razorpay_ok else '❌ FAIL'}")
    
    if razorpay_ok:
        print("\n🎉 SUCCESS! Your Razorpay integration is working on Railway!")
        print("💡 You can now safely use the order creation functionality")
        
        # Optional: Test actual order creation
        test_orders = input("\nDo you want to test actual order creation? (y/N): ").strip().lower()
        if test_orders == 'y':
            order_ok = test_order_creation()
            print(f"🛍️ Order Creation: {'✅ PASS' if order_ok else '❌ FAIL'}")
    else:
        print("\n❌ Razorpay integration has issues on Railway")
        print("💡 Check the error messages above and:")
        print("   1. Verify your Railway environment variables are set")
        print("   2. Check Railway logs for detailed errors")
        print("   3. Ensure your Razorpay credentials are valid")
    
    print(f"\n🕒 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
