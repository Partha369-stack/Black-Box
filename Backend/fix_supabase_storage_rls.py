#!/usr/bin/env python3
"""
Fix Supabase Storage RLS Policies for Black Box Project
This script will help create the necessary RLS policies for the storage bucket.
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def create_storage_policies():
    """Create RLS policies for the storage bucket"""
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Missing Supabase credentials in .env file")
        return False
    
    print("🔧 Setting up Supabase Storage RLS Policies...")
    
    # Extract project reference from URL
    project_ref = SUPABASE_URL.split('//')[1].split('.')[0]
    
    print(f"📋 Supabase Project: {project_ref}")
    print(f"🔗 Dashboard URL: https://app.supabase.com/project/{project_ref}")
    
    print("\n📝 To fix the storage RLS issue, please follow these steps manually:")
    print("\n1. Go to your Supabase Dashboard:")
    print(f"   https://app.supabase.com/project/{project_ref}/storage/buckets")
    
    print("\n2. Select your 'product-images' bucket")
    
    print("\n3. Go to 'Policies' tab and create these RLS policies:")
    
    print("\n   Policy 1: Allow INSERT for authenticated users")
    print("   - Name: Enable insert for authenticated users")
    print("   - Policy: INSERT")
    print("   - Target roles: authenticated")
    print("   - USING expression: true")
    
    print("\n   Policy 2: Allow SELECT for everyone (public access)")
    print("   - Name: Enable read access for everyone")
    print("   - Policy: SELECT")
    print("   - Target roles: public")
    print("   - USING expression: true")
    
    print("\n   Policy 3: Allow UPDATE for authenticated users")
    print("   - Name: Enable update for authenticated users")
    print("   - Policy: UPDATE")
    print("   - Target roles: authenticated")
    print("   - USING expression: true")
    
    print("\n   Policy 4: Allow DELETE for authenticated users")
    print("   - Name: Enable delete for authenticated users")
    print("   - Policy: DELETE")
    print("   - Target roles: authenticated")
    print("   - USING expression: true")
    
    print("\n4. Alternative: Run these SQL commands in your SQL Editor:")
    print("   https://app.supabase.com/project/{}/sql/new".format(project_ref))
    
    sql_commands = """
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read files from product-images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload files to product-images bucket
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update files in product-images bucket
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete files from product-images bucket
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
"""
    
    print(sql_commands)
    
    print("\n5. Make sure your bucket is set to 'Public bucket' in bucket settings")
    
    print("\n6. After applying policies, restart your backend server")
    
    return True

if __name__ == "__main__":
    create_storage_policies()
