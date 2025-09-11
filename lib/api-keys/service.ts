import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/client"
import { ApiKey, ApiKeyWithSecret, CreateApiKeyRequest, ApiUsageLog, API_RATE_LIMITS } from "./types"
import { UserTier } from "@/app/types/user"
import crypto from 'crypto'

export class ApiKeyService {
  private static generateApiKey(): { key: string, hash: string, prefix: string } {
    // Generate a secure random key
    const key = `sk_live_${crypto.randomBytes(32).toString('hex')}`
    
    // Create hash for storage
    const hash = crypto.createHash('sha256').update(key).digest('hex')
    
    // Store the full key as prefix so it can be copied
    // We'll format it for display in the frontend
    const prefix = key
    
    return { key, hash, prefix }
  }

  static async createApiKey(
    userId: string, 
    request: CreateApiKeyRequest,
    userTier: UserTier
  ): Promise<ApiKeyWithSecret | null> {
    console.log('ApiKeyService.createApiKey - Starting creation for user:', userId, 'tier:', userTier)
    console.log('ApiKeyService.createApiKey - Request:', request)
    
    // Check if user tier allows API access
    if (userTier === 'basic') {
      throw new Error('API access requires Pro or Enterprise tier')
    }

    const supabase = createServiceClient()
    if (!supabase) {
      console.error('ApiKeyService.createApiKey - Failed to create service client')
      throw new Error('Database connection failed')
    }

    // Check existing API key count limits
    console.log('ApiKeyService.createApiKey - Checking existing active keys for user:', userId)
    const { data: existingKeys, error: countError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)

    console.log('ApiKeyService.createApiKey - Existing keys query result:', { count: existingKeys?.length || 0, error: countError })

    if (countError) {
      console.error('ApiKeyService.createApiKey - Error checking existing keys:', countError)
      throw new Error(`Failed to check existing keys: ${countError.message}`)
    }

    const maxKeys = userTier === 'enterprise' ? 10 : 3
    console.log('ApiKeyService.createApiKey - Key limit check:', { existing: existingKeys?.length || 0, max: maxKeys })
    
    if (existingKeys && existingKeys.length >= maxKeys) {
      console.error('ApiKeyService.createApiKey - Max keys exceeded:', { existing: existingKeys.length, max: maxKeys })
      throw new Error(`Maximum ${maxKeys} API keys allowed for ${userTier} tier`)
    }

    // Generate the API key
    console.log('ApiKeyService.createApiKey - Generating new key')
    const { key, hash, prefix } = this.generateApiKey()
    console.log('ApiKeyService.createApiKey - Generated key prefix:', prefix.substring(0, 10) + '...')

    // Insert into database
    console.log('ApiKeyService.createApiKey - Inserting into database')
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        key_name: request.key_name,
        key_hash: hash,
        key_prefix: prefix,
        permissions: request.permissions,
        expires_at: request.expires_at,
        allowed_origins: request.allowed_origins
      })
      .select()
      .single()

    console.log('ApiKeyService.createApiKey - Database insert result:', { error, hasData: !!data })

    if (error) {
      console.error('ApiKeyService.createApiKey - Database insert error:', error)
      throw new Error(`Failed to create API key: ${error.message}`)
    }

    console.log('ApiKeyService.createApiKey - Successfully created API key:', data?.id)
    return {
      apiKey: data as ApiKey,
      secretKey: key
    }
  }

  static async getApiKeys(userId: string): Promise<ApiKey[]> {
    const supabase = createServiceClient()
    if (!supabase) {
      console.error('Failed to create service client for getApiKeys')
      return []
    }

    console.log('getApiKeys - Fetching keys for user:', userId) // Debug log

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    console.log('getApiKeys - Database query result:', { data, error }) // Debug log

    if (error) {
      console.error('Failed to fetch API keys:', error)
      return []
    }

    console.log('getApiKeys - Returning', data?.length || 0, 'keys') // Debug log
    return data as ApiKey[]
  }

  static async validateApiKey(keyHash: string): Promise<{
    isValid: boolean
    apiKey?: ApiKey
    user?: any
    rateLimitExceeded?: boolean
  }> {
    const supabase = createServiceClient()
    if (!supabase) {
      return { isValid: false }
    }

    // Get API key with user information
    const { data, error } = await supabase
      .from('api_keys')
      .select(`
        *,
        users!inner(id, email, tier, credits, is_active)
      `)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { isValid: false }
    }

    const apiKey = data as any
    const user = apiKey.users

    // Check if user is active
    if (!user.is_active) {
      return { isValid: false }
    }

    // Check expiration
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return { isValid: false }
    }

    // Check rate limits
    const limits = API_RATE_LIMITS[user.tier as UserTier]
    const rateLimitExceeded = 
      apiKey.requests_today >= limits.requests_per_day ||
      apiKey.requests_this_month >= limits.requests_per_month

    return {
      isValid: true,
      apiKey: apiKey as ApiKey,
      user: user,
      rateLimitExceeded
    }
  }

  static async incrementUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTimeMs: number,
    ipAddress?: string,
    userAgent?: string,
    tokensUsed: number = 0,
    creditsConsumed: number = 0,
    errorMessage?: string
  ): Promise<void> {
    const supabase = createServiceClient()
    if (!supabase) return

    try {
      // Update API key usage counters
      await supabase.rpc('increment_api_usage', {
        key_id: apiKeyId,
        ip: ipAddress
      })

      // Log the usage
      await supabase
        .from('api_usage_logs')
        .insert({
          api_key_id: apiKeyId,
          user_id: '', // Will be filled by trigger
          endpoint,
          method,
          status_code: statusCode,
          response_time_ms: responseTimeMs,
          tokens_used: tokensUsed,
          credits_consumed: creditsConsumed,
          ip_address: ipAddress,
          user_agent: userAgent,
          error_message: errorMessage
        })
    } catch (error) {
      console.error('Failed to log API usage:', error)
    }
  }

  static async deactivateApiKey(userId: string, keyId: string): Promise<boolean> {
    const supabase = createServiceClient()
    if (!supabase) {
      console.error('Failed to create service client for deactivateApiKey')
      return false
    }

    console.log('deactivateApiKey - Deactivating key:', keyId, 'for user:', userId) // Debug log

    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', userId)

    console.log('deactivateApiKey - Database update result:', { error }) // Debug log

    if (error) {
      console.error('Failed to deactivate API key:', error)
      return false
    }

    console.log('deactivateApiKey - Successfully deactivated key:', keyId) // Debug log
    return true
  }

  static async getUsageStats(userId: string, keyId?: string): Promise<{
    totalRequests: number
    requestsToday: number
    requestsThisMonth: number
    recentLogs: ApiUsageLog[]
  }> {
    const supabase = createClient()
    if (!supabase) {
      return {
        totalRequests: 0,
        requestsToday: 0,
        requestsThisMonth: 0,
        recentLogs: []
      }
    }

    let query = supabase
      .from('api_usage_logs')
      .select('*')
      .eq('user_id', userId)

    if (keyId) {
      query = query.eq('api_key_id', keyId)
    }

    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Failed to fetch usage stats:', error)
      return {
        totalRequests: 0,
        requestsToday: 0,
        requestsThisMonth: 0,
        recentLogs: []
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const requestsToday = logs?.filter(log => 
      new Date(log.created_at) >= today
    ).length || 0

    const requestsThisMonth = logs?.filter(log => 
      new Date(log.created_at) >= thisMonth
    ).length || 0

    return {
      totalRequests: logs?.length || 0,
      requestsToday,
      requestsThisMonth,
      recentLogs: logs as ApiUsageLog[] || []
    }
  }
}
