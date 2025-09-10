-- Function to increment API usage counters
CREATE OR REPLACE FUNCTION increment_api_usage(
  key_id UUID,
  ip INET DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET 
    total_requests = total_requests + 1,
    requests_today = requests_today + 1,
    requests_this_month = requests_this_month + 1,
    last_used_at = NOW(),
    last_ip_address = COALESCE(ip, last_ip_address),
    updated_at = NOW()
  WHERE id = key_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get API key with user info (for authentication)
CREATE OR REPLACE FUNCTION get_api_key_with_user(key_hash TEXT)
RETURNS TABLE (
  key_id UUID,
  user_id UUID,
  user_email TEXT,
  user_tier TEXT,
  user_credits INTEGER,
  key_name TEXT,
  permissions JSONB,
  requests_today INTEGER,
  requests_this_month INTEGER,
  is_active BOOLEAN,
  expires_at TIMESTAMPTZ,
  allowed_origins TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ak.id,
    u.id,
    u.email,
    u.tier,
    u.credits,
    ak.key_name,
    ak.permissions,
    ak.requests_today,
    ak.requests_this_month,
    ak.is_active,
    ak.expires_at,
    ak.allowed_origins
  FROM api_keys ak
  JOIN users u ON ak.user_id = u.id
  WHERE ak.key_hash = get_api_key_with_user.key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically fill user_id in api_usage_logs
CREATE OR REPLACE FUNCTION fill_api_usage_user_id()
RETURNS TRIGGER AS $$
BEGIN
  SELECT user_id INTO NEW.user_id
  FROM api_keys
  WHERE id = NEW.api_key_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_fill_api_usage_user_id ON api_usage_logs;
CREATE TRIGGER trigger_fill_api_usage_user_id
  BEFORE INSERT ON api_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION fill_api_usage_user_id();

-- Function to clean up old usage logs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS void AS $$
BEGIN
  -- Keep logs for 90 days
  DELETE FROM api_usage_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log cleanup action
  RAISE NOTICE 'Cleaned up API usage logs older than 90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to get usage statistics for a user
CREATE OR REPLACE FUNCTION get_user_api_stats(user_uuid UUID)
RETURNS TABLE (
  total_requests BIGINT,
  requests_today BIGINT,
  requests_this_month BIGINT,
  active_keys INTEGER,
  last_request_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(ak.total_requests), 0) as total_requests,
    COALESCE(SUM(ak.requests_today), 0) as requests_today,
    COALESCE(SUM(ak.requests_this_month), 0) as requests_this_month,
    COUNT(*)::INTEGER as active_keys,
    MAX(ak.last_used_at) as last_request_at
  FROM api_keys ak
  WHERE ak.user_id = user_uuid 
    AND ak.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at_desc ON api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint_status ON api_usage_logs(endpoint, status_code);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_created ON api_usage_logs(user_id, created_at DESC);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_api_usage TO service_role;
GRANT EXECUTE ON FUNCTION get_api_key_with_user TO service_role;
GRANT EXECUTE ON FUNCTION get_user_api_stats TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_api_logs TO service_role;
