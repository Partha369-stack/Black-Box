-- Create the inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  phone VARCHAR(20),
  query_type VARCHAR(50) NOT NULL CHECK (query_type IN ('location', 'products', 'support', 'feedback', 'general')),
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  response_message TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_inquiries_query_type ON inquiries(query_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at when a row is modified
CREATE TRIGGER update_inquiries_updated_at 
    BEFORE UPDATE ON inquiries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow anonymous users to insert inquiries (for contact form submissions)
CREATE POLICY "Allow anonymous insert" ON inquiries
    FOR INSERT 
    TO anon 
    WITH CHECK (true);

-- Allow authenticated users to view all inquiries (for admin dashboard)
CREATE POLICY "Allow authenticated read" ON inquiries
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Allow authenticated users to update inquiries (for admin dashboard)
CREATE POLICY "Allow authenticated update" ON inquiries
    FOR UPDATE 
    TO authenticated 
    USING (true);

-- Create a view for inquiry statistics (optional, for better performance)
CREATE OR REPLACE VIEW inquiry_stats AS
SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'new') as new,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
    COUNT(*) FILTER (WHERE status = 'closed') as closed,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent,
    COUNT(*) FILTER (WHERE priority = 'high') as high,
    COUNT(*) FILTER (WHERE priority = 'medium') as medium,
    COUNT(*) FILTER (WHERE priority = 'low') as low,
    COUNT(*) FILTER (WHERE query_type = 'location') as location_queries,
    COUNT(*) FILTER (WHERE query_type = 'products') as product_queries,
    COUNT(*) FILTER (WHERE query_type = 'support') as support_queries,
    COUNT(*) FILTER (WHERE query_type = 'feedback') as feedback_queries,
    COUNT(*) FILTER (WHERE query_type = 'general') as general_queries
FROM inquiries;

-- Grant necessary permissions
GRANT SELECT ON inquiry_stats TO anon, authenticated;
