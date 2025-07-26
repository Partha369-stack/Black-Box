#!/usr/bin/env python3
"""
Automated Railway Razorpay Test
Tests your Railway deployment automatically
"""

import requests
import json
from datetime import datetime

# Default Railway URL - update if different
RAILWAY_URL = "https://black-box-production.up.railway.app"

def test_railway_razorpay():
    """Test Razorpay functionality on Railway"""
    print("🧪 Testing Razorpay integration on Railway...")
    print(f"🔗 Testing URL: {RAILWAY_URL}")
    
    try:
        # First test health
        print("\n🏥 Testing Railway health...")
        health_response = requests.get(f"{RAILWAY_URL}/api/health", timeout=10)
        
        if health_response.status_code == 200:
            print("✅ Railway deployment is healthy")
        else:
            print(f"⚠️ Railway health check: {health_response.status_code}")
        
        # Test Razorpay integration
        print("\n💳 Testing Razorpay integration...")
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
                return True
            else:
                print(f"\n⚠️ Some tests failed. Overall status: {data.get('overall_status', 'UNKNOWN')}")
                
            print(f"\n💡 Recommendation: {data.get('recommendation')}")
            return False
            
        elif response.status_code == 400:
            # Check for credential issues
            try:
                error_data = response.json()
                print(f"❌ Credential Issue: {error_data.get('error')}")
                
                if 'credentials not available' in error_data.get('error', '').lower():
                    print("\n🔧 ISSUE: Razorpay credentials are not set in Railway environment")
                    print("💡 To fix this:")
                    print("   1. Go to your Railway project dashboard")
                    print("   2. Go to Variables tab")
                    print("   3. Add these environment variables:")
                    print("      - RAZORPAY_KEY_ID=your_razorpay_key_id")
                    print("      - RAZORPAY_KEY_SECRET=your_razorpay_key_secret")
                    print("   4. Redeploy your service")
                
            except:
                print(f"❌ Error response: {response.text}")
            
            return False
            
        else:
            print(f"❌ Railway Razorpay test failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"📄 Error Details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"📄 Raw Response: {response.text}")
            
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Railway deployment")
        print("💡 Possible issues:")
        print("   1. Railway URL might be incorrect")
        print("   2. Railway service might be down")
        print("   3. Network connection issues")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ Request timed out - Railway might be slow or unresponsive")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_debug_endpoint():
    """Test debug endpoint"""
    print("\n🔍 Testing debug endpoint...")
    
    try:
        response = requests.get(f"{RAILWAY_URL}/debug/razorpay", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Debug endpoint accessible")
            print(f"   Razorpay Key ID Set: {data.get('razorpay_key_id_set')}")
            print(f"   Razorpay Secret Set: {data.get('razorpay_secret_set')}")
            print(f"   Environment: {data.get('environment')}")
            print(f"   Service Status: {data.get('service_status')}")
            return True
        else:
            print(f"❌ Debug endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Debug endpoint error: {str(e)}")
        return False

def main():
    """Run automated tests"""
    print("🚀 AUTOMATED RAILWAY RAZORPAY TEST")
    print("=" * 50)
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Run tests
    debug_ok = test_debug_endpoint()
    razorpay_ok = test_railway_razorpay()
    
    # Results
    print("\n" + "=" * 50)
    print("📊 FINAL RESULTS")
    print("=" * 50)
    
    print(f"🔍 Debug Endpoint: {'✅ PASS' if debug_ok else '❌ FAIL'}")
    print(f"💳 Razorpay Integration: {'✅ PASS' if razorpay_ok else '❌ FAIL'}")
    
    if razorpay_ok:
        print("\n🎉 SUCCESS! Your Razorpay integration is working on Railway!")
        print("💡 The 500 error you were seeing should now be resolved")
    else:
        print("\n❌ Razorpay integration has issues on Railway")
        print("💡 This explains the 500 error you're experiencing")
    
    print(f"\n🕒 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return razorpay_ok

if __name__ == "__main__":
    main()
