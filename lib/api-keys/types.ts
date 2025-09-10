export interface ApiKey {
  id: string
  user_id: string
  key_name: string
  key_prefix: string
  permissions: string[]
  total_requests: number
  last_used_at: string | null
  requests_today: number
  requests_this_month: number
  daily_reset_at: string
  monthly_reset_at: string
  is_active: boolean
  created_at: string
  updated_at: string
  expires_at: string | null
  last_ip_address: string | null
  allowed_origins: string[] | null
}

export interface ApiUsageLog {
  id: string
  api_key_id: string
  user_id: string
  endpoint: string
  method: string
  status_code: number
  response_time_ms: number | null
  tokens_used: number
  credits_consumed: number
  ip_address: string | null
  user_agent: string | null
  referer: string | null
  error_message: string | null
  created_at: string
}

export interface CreateApiKeyRequest {
  key_name: string
  permissions: string[]
  expires_at?: string | null
  allowed_origins?: string[]
}

export interface ApiKeyWithSecret {
  apiKey: ApiKey
  secretKey: string // Only returned once during creation
}

export interface RateLimitConfig {
  requests_per_day: number
  requests_per_month: number
  requests_per_minute: number
  burst_limit: number
}

export interface TierLimits {
  basic: RateLimitConfig
  pro: RateLimitConfig
  enterprise: RateLimitConfig
}

export const API_RATE_LIMITS: TierLimits = {
  basic: {
    requests_per_day: 0, // No API access for basic users
    requests_per_month: 0,
    requests_per_minute: 0,
    burst_limit: 0
  },
  pro: {
    requests_per_day: 1000,
    requests_per_month: 25000,
    requests_per_minute: 50,
    burst_limit: 100
  },
  enterprise: {
    requests_per_day: 10000,
    requests_per_month: 250000,
    requests_per_minute: 200,
    burst_limit: 500
  }
}

export const API_PERMISSIONS = {
  SEARCH: 'search',
  PEOPLE: 'people',
  ANALYTICS: 'analytics',
  PROJECTS: 'projects',
  MODELS: 'models'
} as const

export type ApiPermission = typeof API_PERMISSIONS[keyof typeof API_PERMISSIONS]
