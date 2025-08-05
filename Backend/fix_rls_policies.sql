-- Fix RLS policies for Black Box vending machine project
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/[your-project]/sql/new

-- Enable RLS on inventory table (if not already enabled)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for service role" ON inventory;
DROP POLICY IF EXISTS "Enable read for all users" ON inventory;
DROP POLICY IF EXISTS "Enable insert for all users" ON inventory;
DROP POLICY IF EXISTS "Enable update for all users" ON inventory;
DROP POLICY IF EXISTS "Enable delete for all users" ON inventory;

-- Create comprehensive policies for inventory table
CREATE POLICY "Enable all operations for service role" ON inventory
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON inventory
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON inventory
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON inventory
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON inventory
  FOR DELETE USING (true);

-- Enable RLS on orders table (if not already enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for service role" ON orders;
DROP POLICY IF EXISTS "Enable read for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for all users" ON orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON orders;

-- Create comprehensive policies for orders table
CREATE POLICY "Enable all operations for service role" ON orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON orders
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON orders
  FOR DELETE USING (true);

-- Fix storage policies for product-images bucket
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Enable all operations for product-images" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Enable all operations for product-images" ON storage.objects
  FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'product-images');

-- Grant necessary permissions to authenticated and anon roles
GRANT ALL ON inventory TO authenticated;
GRANT ALL ON inventory TO anon;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO anon;

-- Ensure service role has full access (should be default)
GRANT ALL ON inventory TO service_role;
GRANT ALL ON orders TO service_role;
GRANT ALL ON storage.objects TO service_role;

-- Success message
SELECT 'RLS policies have been updated successfully!' as message;
