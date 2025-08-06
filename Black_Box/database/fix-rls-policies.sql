-- Fix RLS policies for inquiries table
-- Run this in your Supabase SQL Editor

-- Enable RLS on inquiries table (if not already enabled)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON inquiries;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON inquiries;
DROP POLICY IF EXISTS "Allow public read access" ON inquiries;
DROP POLICY IF EXISTS "Allow public update access" ON inquiries;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON inquiries;
DROP POLICY IF EXISTS "Allow authenticated read" ON inquiries;
DROP POLICY IF EXISTS "Allow authenticated update" ON inquiries;

-- Policy 1: Allow anyone to insert inquiries (for contact form)
CREATE POLICY "Allow anonymous inserts" ON inquiries
FOR INSERT TO anon
WITH CHECK (true);

-- Policy 2: Allow reading all inquiries with anon key (for admin dashboard)
-- Note: This is for demo purposes. In production, you should use authenticated users.
CREATE POLICY "Allow public read access" ON inquiries
FOR SELECT TO anon
USING (true);

-- Policy 3: Allow updates with anon key (for admin dashboard)
-- Note: This is for demo purposes. In production, you should use authenticated users.
CREATE POLICY "Allow public update access" ON inquiries
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- Policy 4: Allow delete with anon key (for admin dashboard)
CREATE POLICY "Allow public delete access" ON inquiries
FOR DELETE TO anon
USING (true);

-- Also allow for authenticated users (backup)
CREATE POLICY "Allow authenticated read" ON inquiries
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated update" ON inquiries
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated insert" ON inquiries
FOR INSERT TO authenticated
WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'inquiries';

-- Test query to ensure it works
SELECT COUNT(*) FROM inquiries;
