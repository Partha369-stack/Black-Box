-- Fix Supabase Storage RLS Policies for Black Box Project
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/xgjdaavxwhvhcbycdbtv/sql/new

-- First, drop any existing conflicting policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload" ON storage.objects; 
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for everyone" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON storage.objects;

-- Create comprehensive policies for the product-images bucket
-- Allow public read access (for displaying images)
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- Allow all operations for service role (bypasses RLS completely for backend)
CREATE POLICY "Allow all for service role" ON storage.objects
    FOR ALL USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');

-- Alternative: If the above doesn't work, use this more permissive policy
-- CREATE POLICY "Allow all operations" ON storage.objects
--     FOR ALL USING (bucket_id = 'product-images')
--     WITH CHECK (bucket_id = 'product-images');

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Also ensure the bucket exists and is configured properly
-- (This would need to be done manually in the dashboard if bucket doesn't exist)
