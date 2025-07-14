-- Create people_db table for identity verification data
-- Run this script in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS people_db (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_date TIMESTAMPTZ,
  name TEXT,
  email TEXT,
  result TEXT,
  is_valid BOOLEAN,
  mobile_phone TEXT,
  line_type TEXT,
  status TEXT,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_people_db_address ON people_db(address);

-- Create full-text search index for better search capabilities
CREATE INDEX IF NOT EXISTS idx_people_db_fulltext ON people_db 
USING gin(to_tsvector('english', 
  coalesce(name, '') || ' ' || 
  coalesce(email, '') || ' ' || 
  coalesce(first_name, '') || ' ' || 
  coalesce(last_name, '') || ' ' || 
  coalesce(mobile_phone, '') || ' ' || 
  coalesce(city, '') || ' ' || 
  coalesce(state, '') || ' ' ||
  coalesce(address, '')
));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_people_db_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_people_db_updated_at
  BEFORE UPDATE ON people_db
  FOR EACH ROW
  EXECUTE FUNCTION update_people_db_updated_at(); 