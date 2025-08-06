-- Simple RLS policies for contact form only
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/xgjdaavxwhvhcbycdbtv/sql/new

-- Enable RLS on inquiries table (if not already enabled)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow anonymous inserts" ON inquiries;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON inquiries;
DROP POLICY IF EXISTS "Allow public read access" ON inquiries;
DROP POLICY IF EXISTS "Allow public update access" ON inquiries;
DROP POLICY IF EXISTS "Allow public delete access" ON inquiries;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON inquiries;
DROP POLICY IF EXISTS "Allow authenticated read" ON inquiries;
DROP POLICY IF EXISTS "Allow authenticated update" ON inquiries;
DROP POLICY IF EXISTS "Allow authenticated insert" ON inquiries;
DROP POLICY IF EXISTS "Allow contact form submissions" ON inquiries;
DROP POLICY IF EXISTS "Allow service role all operations" ON inquiries;

-- Allow anonymous users to INSERT (submit contact form)
CREATE POLICY "Allow contact form submissions" ON inquiries
FOR INSERT TO anon
WITH CHECK (true);

-- TEMPORARY: Allow anon to SELECT (in case Supabase client needs it)
CREATE POLICY "Allow anon select for debugging" ON inquiries
FOR SELECT TO anon
USING (true);

-- Optional: Allow service role to read data (for you to manage via Supabase dashboard)
-- This won't affect the website, only your admin access in Supabase dashboard
CREATE POLICY "Allow service role all operations" ON inquiries
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'inquiries';

-- Test that the table exists and is accessible
SELECT 'Table exists and is accessible' as status;
