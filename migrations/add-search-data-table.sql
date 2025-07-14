-- Migration to add search data table
-- Run this script in your Supabase SQL editor

-- Create search_data table with the provided CSV headers
CREATE TABLE IF NOT EXISTS search_data (
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

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_search_data_name ON search_data(name);
CREATE INDEX IF NOT EXISTS idx_search_data_email ON search_data(email);
CREATE INDEX IF NOT EXISTS idx_search_data_first_name ON search_data(first_name);
CREATE INDEX IF NOT EXISTS idx_search_data_last_name ON search_data(last_name);
CREATE INDEX IF NOT EXISTS idx_search_data_mobile_phone ON search_data(mobile_phone);
CREATE INDEX IF NOT EXISTS idx_search_data_city ON search_data(city);
CREATE INDEX IF NOT EXISTS idx_search_data_state ON search_data(state);

-- Create full-text search index for better search capabilities
CREATE INDEX IF NOT EXISTS idx_search_data_fulltext ON search_data 
USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, '') || ' ' || 
                      coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || 
                      coalesce(mobile_phone, '') || ' ' || coalesce(city, '') || ' ' || 
                      coalesce(state, '')));

-- Enable Row Level Security (RLS) for the table
ALTER TABLE search_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read search data
CREATE POLICY "Authenticated users can read search data" ON search_data
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow service role to insert/update/delete search data
CREATE POLICY "Service role can manage search data" ON search_data
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to search the data
CREATE OR REPLACE FUNCTION search_user_data(search_term TEXT)
RETURNS TABLE (
  id UUID,
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
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id,
    sd.reg_date,
    sd.name,
    sd.email,
    sd.result,
    sd.is_valid,
    sd.mobile_phone,
    sd.line_type,
    sd.status,
    sd.first_name,
    sd.last_name,
    sd.address,
    sd.city,
    sd.state,
    sd.created_at,
    sd.updated_at
  FROM search_data sd
  WHERE 
    sd.name ILIKE '%' || search_term || '%' OR
    sd.email ILIKE '%' || search_term || '%' OR
    sd.first_name ILIKE '%' || search_term || '%' OR
    sd.last_name ILIKE '%' || search_term || '%' OR
    sd.mobile_phone ILIKE '%' || search_term || '%' OR
    sd.city ILIKE '%' || search_term || '%' OR
    sd.state ILIKE '%' || search_term || '%' OR
    to_tsvector('english', coalesce(sd.name, '') || ' ' || coalesce(sd.email, '') || ' ' || 
                coalesce(sd.first_name, '') || ' ' || coalesce(sd.last_name, '') || ' ' || 
                coalesce(sd.mobile_phone, '') || ' ' || coalesce(sd.city, '') || ' ' || 
                coalesce(sd.state, '')) @@ plainto_tsquery('english', search_term)
  ORDER BY sd.created_at DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_user_data(TEXT) TO authenticated; 