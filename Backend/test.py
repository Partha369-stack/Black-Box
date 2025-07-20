#!/usr/bin/env python3
# Test Supabase Connection

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🧪 Testing Supabase Connection...")
print("="*50)

# Test environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

print(f"📊 Environment Variables:")
print(f"   SUPABASE_URL: {'✅ Found' if SUPABASE_URL else '❌ Missing'}")
print(f"   SUPABASE_KEY: {'✅ Found' if SUPABASE_KEY else '❌ Missing'}")

if SUPABASE_URL:
    print(f"   URL Preview: {SUPABASE_URL[:50]}...")
if SUPABASE_KEY:
    print(f"   Key Preview: {SUPABASE_KEY[:30]}...")

print("\n🔗 Testing Supabase Client Creation...")
try:
    from supabase import create_client
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client created successfully!")
    
    # Test a simple query
    print("\n📋 Testing database connection...")
    try:
        # Try to get table info (this will fail gracefully if tables don't exist)
        response = client.table('inventory').select('count').execute()
        print("✅ Database connection successful!")
        print(f"   Response: {response.data if hasattr(response, 'data') else 'Connected'}")
    except Exception as e:
        print(f"⚠️ Database query test failed (tables might not exist yet): {e}")
        print("   This is normal if you haven't set up the database tables yet.")
        
except Exception as e:
    print(f"❌ Supabase connection failed: {e}")
    print("\n💡 Troubleshooting:")
    print("   1. Check your .env file has correct SUPABASE_URL and SUPABASE_KEY")
    print("   2. Make sure you have the 'supabase' Python package installed:")
    print("      pip install supabase")
    print("   3. Verify your Supabase project is active")

print("\n" + "="*50)
print("🏁 Test Complete!")
