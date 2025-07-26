#!/usr/bin/env python3
"""
Razorpay API Diagnostic Tool
Test Razorpay API keys to ensure they are working properly.
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Razorpay keys
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')

# Simple function to test Razorpay API
def test_razorpay_api():
    """Verify Razorpay API credentials"""
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        print("❌ Razorpay credentials are not set in environment.")
        return
    
    try:
        # Perform a simple GET request to verify credentials
        auth = (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
        response = requests.get('https://api.razorpay.com/v1/payments', auth=auth)
        
        if response.status_code == 200:
            print("✅ Razorpay API credentials are valid.")
        elif response.status_code == 401:
            print("❌ Razorpay API credentials are invalid.")
        else:
            print(f"⚠️ Received unexpected response status: {response.status_code}")
    except Exception as e:
        print(f"❌ Failed to verify Razorpay API: {e}")

if __name__ == "__main__":
    test_razorpay_api()
