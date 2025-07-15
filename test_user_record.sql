-- Test query to check your user record
-- Replace 'your-email@example.com' with your actual email
SELECT 
  id,
  email,
  anonymous,
  daily_message_count,
  daily_reset,
  message_count,
  premium,
  created_at
FROM users 
WHERE email = 'your-email@example.com';

-- If no record exists, this will create one with all required fields
-- Replace 'your-user-id' with your actual user ID and 'your-email@example.com' with your email
INSERT INTO users (
  id,
  email,
  anonymous,
  daily_message_count,
  daily_reset,
  message_count,
  premium,
  preferred_model,
  created_at
) VALUES (
  'your-user-id',
  'your-email@example.com', 
  FALSE,
  0,
  NOW(),
  0,
  FALSE,
  'ministral-8b-latest',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  anonymous = EXCLUDED.anonymous,
  daily_message_count = EXCLUDED.daily_message_count,
  daily_reset = EXCLUDED.daily_reset;
