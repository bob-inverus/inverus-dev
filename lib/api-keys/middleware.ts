import { NextRequest, NextResponse } from 'next/server'
import { ApiKeyService } from './service'
import { API_RATE_LIMITS, ApiPermission } from './types'
import { UserTier } from '@/app/types/user'
import crypto from 'crypto'

export interface AuthenticatedRequest extends NextRequest {
  apiKey?: any
  user?: any
  rateLimits?: any
}

export interface ApiAuthResult {
  success: boolean
  error?: string
  request?: AuthenticatedRequest
  response?: NextResponse
}

export class ApiAuthMiddleware {
  /**
   * Extract API key from request headers
   */
  private static extractApiKey(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization')
    
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
    
    // Also check X-API-Key header as alternative
    const apiKeyHeader = request.headers.get('x-api-key')
    if (apiKeyHeader) {
      return apiKeyHeader
    }
    
    return null
  }

  /**
   * Hash the API key for database lookup
   */
  private static hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex')
  }

  /**
   * Check rate limits based on user tier
   */
  private static checkRateLimit(
    apiKey: any, 
    userTier: UserTier,
    endpoint: string
  ): { allowed: boolean; error?: string } {
    const limits = API_RATE_LIMITS[userTier]
    
    // Check daily limit
    if (apiKey.requests_today >= limits.requests_per_day) {
      return {
        allowed: false,
        error: `Daily rate limit exceeded. Limit: ${limits.requests_per_day} requests per day`
      }
    }
    
    // Check monthly limit
    if (apiKey.requests_this_month >= limits.requests_per_month) {
      return {
        allowed: false,
        error: `Monthly rate limit exceeded. Limit: ${limits.requests_per_month} requests per month`
      }
    }
    
    return { allowed: true }
  }

  /**
   * Check if API key has required permissions for endpoint
   */
  private static checkPermissions(
    apiKey: any,
    requiredPermission: ApiPermission
  ): { allowed: boolean; error?: string } {
    if (!apiKey.permissions || !Array.isArray(apiKey.permissions)) {
      return { allowed: false, error: 'No permissions configured for API key' }
    }
    
    if (!apiKey.permissions.includes(requiredPermission)) {
      return {
        allowed: false,
        error: `Missing required permission: ${requiredPermission}`
      }
    }
    
    return { allowed: true }
  }

  /**
   * Validate CORS origins if configured
   */
  private static checkCORS(
    request: NextRequest,
    allowedOrigins: string[] | null
  ): { allowed: boolean; error?: string } {
    if (!allowedOrigins || allowedOrigins.length === 0) {
      return { allowed: true } // No CORS restrictions
    }
    
    const origin = request.headers.get('origin')
    if (!origin) {
      return { allowed: true } // No origin header (e.g., server-to-server)
    }
    
    if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
      return {
        allowed: false,
        error: `Origin ${origin} not allowed`
      }
    }
    
    return { allowed: true }
  }

  /**
   * Main authentication function
   */
  static async authenticate(
    request: NextRequest,
    requiredPermission: ApiPermission
  ): Promise<ApiAuthResult> {
    const startTime = Date.now()
    
    try {
      // Extract API key
      const rawKey = this.extractApiKey(request)
      if (!rawKey) {
        return {
          success: false,
          error: 'Missing API key. Include it in Authorization header as "Bearer YOUR_KEY" or X-API-Key header',
          response: NextResponse.json(
            { 
              error: 'Authentication required',
              message: 'Missing API key. Include it in Authorization header as "Bearer YOUR_KEY" or X-API-Key header'
            },
            { status: 401 }
          )
        }
      }

      // Hash key for database lookup
      const keyHash = this.hashApiKey(rawKey)
      
      // Validate API key
      const validation = await ApiKeyService.validateApiKey(keyHash)
      
      if (!validation.isValid || !validation.apiKey || !validation.user) {
        return {
          success: false,
          error: 'Invalid API key',
          response: NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
          )
        }
      }

      const { apiKey, user } = validation

      // Check CORS
      const corsCheck = this.checkCORS(request, apiKey.allowed_origins)
      if (!corsCheck.allowed) {
        return {
          success: false,
          error: corsCheck.error,
          response: NextResponse.json(
            { error: 'CORS policy violation', message: corsCheck.error },
            { status: 403 }
          )
        }
      }

      // Check permissions
      const permissionCheck = this.checkPermissions(apiKey, requiredPermission)
      if (!permissionCheck.allowed) {
        return {
          success: false,
          error: permissionCheck.error,
          response: NextResponse.json(
            { error: 'Insufficient permissions', message: permissionCheck.error },
            { status: 403 }
          )
        }
      }

      // Check rate limits
      const rateLimitCheck = this.checkRateLimit(apiKey, user.tier, request.nextUrl.pathname)
      if (!rateLimitCheck.allowed) {
        // Log rate limit exceeded
        await ApiKeyService.incrementUsage(
          apiKey.id,
          request.nextUrl.pathname,
          request.method,
          429,
          Date.now() - startTime,
          request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
          request.headers.get('user-agent') || undefined,
          0,
          0,
          rateLimitCheck.error
        )

        return {
          success: false,
          error: rateLimitCheck.error,
          response: NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              message: rateLimitCheck.error,
              limits: API_RATE_LIMITS[user.tier as UserTier]
            },
            { status: 429 }
          )
        }
      }

      // Create authenticated request object
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.apiKey = apiKey
      authenticatedRequest.user = user
      authenticatedRequest.rateLimits = API_RATE_LIMITS[user.tier as UserTier]

      return {
        success: true,
        request: authenticatedRequest
      }

    } catch (error) {
      console.error('API authentication error:', error)
      
      return {
        success: false,
        error: 'Authentication failed',
        response: NextResponse.json(
          { error: 'Internal authentication error' },
          { status: 500 }
        )
      }
    }
  }

  /**
   * Log successful API request
   */
  static async logRequest(
    apiKey: any,
    request: NextRequest,
    statusCode: number,
    startTime: number,
    tokensUsed: number = 0,
    creditsConsumed: number = 0,
    errorMessage?: string
  ): Promise<void> {
    const responseTime = Date.now() - startTime
    
    await ApiKeyService.incrementUsage(
      apiKey.id,
      request.nextUrl.pathname,
      request.method,
      statusCode,
      responseTime,
      request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || undefined,
      tokensUsed,
      creditsConsumed,
      errorMessage
    )
  }

  /**
   * Create CORS headers for response
   */
  static createCORSHeaders(allowedOrigins?: string[]): Record<string, string> {
    const headers: Record<string, string> = {}
    
    if (allowedOrigins && allowedOrigins.length > 0) {
      if (allowedOrigins.includes('*')) {
        headers['Access-Control-Allow-Origin'] = '*'
      } else {
        // In a real implementation, you'd check the request origin
        // For now, we'll use the first allowed origin
        headers['Access-Control-Allow-Origin'] = allowedOrigins[0]
      }
    }
    
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-API-Key'
    headers['Access-Control-Max-Age'] = '86400'
    
    return headers
  }
}
