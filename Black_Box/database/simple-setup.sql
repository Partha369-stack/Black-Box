-- Step 1: Create the inquiries table
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  phone TEXT,
  query_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  response_message TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policy to allow anonymous users to insert (for contact form)
CREATE POLICY "Enable insert for anonymous users" ON inquiries
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Step 4: Create policy to allow public read access (temporary for testing)
CREATE POLICY "Enable read access for all users" ON inquiries
  FOR SELECT 
  USING (true);

-- Step 5: Create policy to allow public update access (temporary for testing)
CREATE POLICY "Enable update for all users" ON inquiries
  FOR UPDATE 
  USING (true);
