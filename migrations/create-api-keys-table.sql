-- API Keys table for Pro/Enterprise users
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Store hashed version of the key
  key_prefix TEXT NOT NULL, -- Store first 8 characters for display (e.g., "sk_live_12345678...")
  permissions JSONB DEFAULT '[]'::jsonb, -- Array of permissions like ["search", "people", "analytics"]
  
  -- Usage tracking
  total_requests INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Rate limiting
  requests_today INTEGER DEFAULT 0,
  requests_this_month INTEGER DEFAULT 0,
  daily_reset_at TIMESTAMPTZ DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
  monthly_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'),
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration
  
  -- Security
  last_ip_address INET,
  allowed_origins TEXT[], -- CORS origins
  
  CONSTRAINT api_keys_user_id_key_name_unique UNIQUE(user_id, key_name)
);

-- API usage logs for detailed tracking
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  
  -- Usage tracking
  tokens_used INTEGER DEFAULT 0,
  credits_consumed DECIMAL(10,4) DEFAULT 0,
  
  -- Security and debugging
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_daily_reset ON api_keys(daily_reset_at);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);

-- Function to reset daily counters
CREATE OR REPLACE FUNCTION reset_daily_api_counters()
RETURNS void AS $$
BEGIN
  UPDATE api_keys 
  SET 
    requests_today = 0,
    daily_reset_at = CURRENT_DATE + INTERVAL '1 day'
  WHERE daily_reset_at <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly counters
CREATE OR REPLACE FUNCTION reset_monthly_api_counters()
RETURNS void AS $$
BEGIN
  UPDATE api_keys 
  SET 
    requests_this_month = 0,
    monthly_reset_at = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  WHERE monthly_reset_at <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own usage logs
CREATE POLICY "Users can view own usage logs" ON api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert usage logs
CREATE POLICY "Service can insert usage logs" ON api_usage_logs
  FOR INSERT WITH CHECK (true);
