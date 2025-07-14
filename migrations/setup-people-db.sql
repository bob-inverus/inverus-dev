-- Setup people_db table with proper RLS policies
-- Run this script in your Supabase SQL editor

-- Enable Row Level Security (RLS) for the table
ALTER TABLE people_db ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read data
CREATE POLICY "Authenticated users can read people data" ON people_db
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow service role to manage data
CREATE POLICY "Service role can manage people data" ON people_db
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow anonymous users to read data (if needed)
CREATE POLICY "Anonymous users can read people data" ON people_db
  FOR SELECT USING (true);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_people_db_name ON people_db(name);
CREATE INDEX IF NOT EXISTS idx_people_db_email ON people_db(email);
CREATE INDEX IF NOT EXISTS idx_people_db_first_name ON people_db(first_name);
CREATE INDEX IF NOT EXISTS idx_people_db_last_name ON people_db(last_name);
CREATE INDEX IF NOT EXISTS idx_people_db_mobile_phone ON people_db(mobile_phone);
CREATE INDEX IF NOT EXISTS idx_people_db_city ON people_db(city);
CREATE INDEX IF NOT EXISTS idx_people_db_state ON people_db(state);

-- Create full-text search index for better search capabilities
CREATE INDEX IF NOT EXISTS idx_people_db_fulltext ON people_db 
USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, '') || ' ' || 
                      coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || 
                      coalesce(mobile_phone, '') || ' ' || coalesce(city, '') || ' ' || 
                      coalesce(state, '')));

-- Add some sample data for testing (remove this if you have real data)
INSERT INTO people_db (name, email, first_name, last_name, mobile_phone, city, state, status, is_valid) VALUES
('John Doe', 'john.doe@example.com', 'John', 'Doe', '555-1234', 'New York', 'NY', 'active', true),
('Jane Smith', 'jane.smith@example.com', 'Jane', 'Smith', '555-5678', 'Los Angeles', 'CA', 'active', true),
('Bob Johnson', 'bob.johnson@example.com', 'Bob', 'Johnson', '555-9012', 'Chicago', 'IL', 'inactive', false)
ON CONFLICT DO NOTHING; 