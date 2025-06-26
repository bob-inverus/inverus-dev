-- Migration to add user tiers and credits system
-- Run this script in your Supabase SQL editor

-- Add tier and credits columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tier TEXT CHECK (tier IN ('basic', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS credits INTEGER;

-- Set default values for existing users
UPDATE users 
SET tier = 'basic', credits = 50 
WHERE tier IS NULL OR credits IS NULL;

-- Add default constraint for new users
ALTER TABLE users 
ALTER COLUMN tier SET DEFAULT 'basic',
ALTER COLUMN credits SET DEFAULT 50;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- Optional: Create a function to automatically set defaults for new users
CREATE OR REPLACE FUNCTION set_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tier IS NULL THEN
    NEW.tier := 'basic';
  END IF;
  
  IF NEW.credits IS NULL THEN
    CASE NEW.tier
      WHEN 'basic' THEN NEW.credits := 50;
      WHEN 'pro' THEN NEW.credits := 500;
      WHEN 'enterprise' THEN NEW.credits := 1000; -- Default for enterprise, can be customized
      ELSE NEW.credits := 50;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function on insert
DROP TRIGGER IF EXISTS set_user_defaults_trigger ON users;
CREATE TRIGGER set_user_defaults_trigger
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_defaults(); 