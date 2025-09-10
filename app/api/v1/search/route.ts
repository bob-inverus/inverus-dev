import { NextRequest, NextResponse } from 'next/server'
import { ApiAuthMiddleware } from '@/lib/api-keys/middleware'
import { API_PERMISSIONS } from '@/lib/api-keys/types'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: ApiAuthMiddleware.createCORSHeaders()
    })
  }

  // Authenticate request
  const authResult = await ApiAuthMiddleware.authenticate(request, API_PERMISSIONS.SEARCH)
  
  if (!authResult.success) {
    return authResult.response!
  }

  const { apiKey, user } = authResult.request!

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query) {
      await ApiAuthMiddleware.logRequest(apiKey, request, 400, startTime, 0, 0, 'Missing query parameter')
      return NextResponse.json(
        { 
          error: 'Missing query parameter',
          message: 'Include ?q=search_term in your request'
        },
        { 
          status: 400,
          headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
        }
      )
    }

    // Perform search using your existing search logic
    const supabase = createServiceClient()
    if (!supabase) {
      throw new Error('Database connection failed')
    }

    const { data: results, error } = await supabase
      .from('search_data')
      .select('*')
      .textSearch('name', query)
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Search failed: ${error.message}`)
    }

    // Calculate credits consumed (example: 0.1 credits per search)
    const creditsConsumed = 0.1

    // Log successful request
    await ApiAuthMiddleware.logRequest(
      apiKey, 
      request, 
      200, 
      startTime, 
      0, 
      creditsConsumed
    )

    const response = {
      data: results,
      pagination: {
        offset,
        limit,
        total: results?.length || 0
      },
      meta: {
        query,
        response_time_ms: Date.now() - startTime,
        credits_consumed: creditsConsumed
      }
    }

    return NextResponse.json(response, {
      headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
    })

  } catch (error) {
    console.error('Search API error:', error)
    
    await ApiAuthMiddleware.logRequest(
      apiKey, 
      request, 
      500, 
      startTime, 
      0, 
      0, 
      error instanceof Error ? error.message : 'Unknown error'
    )

    return NextResponse.json(
      { 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
      }
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: ApiAuthMiddleware.createCORSHeaders()
    })
  }

  // Authenticate request
  const authResult = await ApiAuthMiddleware.authenticate(request, API_PERMISSIONS.SEARCH)
  
  if (!authResult.success) {
    return authResult.response!
  }

  const { apiKey, user } = authResult.request!

  try {
    const body = await request.json()
    const { queries, options = {} } = body

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      await ApiAuthMiddleware.logRequest(apiKey, request, 400, startTime, 0, 0, 'Missing or invalid queries array')
      return NextResponse.json(
        { 
          error: 'Invalid request',
          message: 'Include "queries" array in request body'
        },
        { 
          status: 400,
          headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
        }
      )
    }

    // Limit batch size based on tier
    const maxBatchSize = user.tier === 'enterprise' ? 50 : 10
    if (queries.length > maxBatchSize) {
      await ApiAuthMiddleware.logRequest(apiKey, request, 400, startTime, 0, 0, `Batch size limit exceeded: ${queries.length} > ${maxBatchSize}`)
      return NextResponse.json(
        { 
          error: 'Batch size limit exceeded',
          message: `Maximum ${maxBatchSize} queries allowed per request for ${user.tier} tier`
        },
        { 
          status: 400,
          headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
        }
      )
    }

    // Process batch search
    const supabase = createServiceClient()
    if (!supabase) {
      throw new Error('Database connection failed')
    }

    const results = await Promise.all(
      queries.map(async (query: string) => {
        const { data, error } = await supabase
          .from('search_data')
          .select('*')
          .textSearch('name', query)
          .limit(options.limit || 10)

        if (error) {
          return { query, error: error.message, data: null }
        }

        return { query, data, error: null }
      })
    )

    // Calculate credits consumed (example: 0.05 credits per query in batch)
    const creditsConsumed = queries.length * 0.05

    // Log successful request
    await ApiAuthMiddleware.logRequest(
      apiKey, 
      request, 
      200, 
      startTime, 
      0, 
      creditsConsumed
    )

    const response = {
      data: results,
      meta: {
        queries_processed: queries.length,
        response_time_ms: Date.now() - startTime,
        credits_consumed: creditsConsumed
      }
    }

    return NextResponse.json(response, {
      headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
    })

  } catch (error) {
    console.error('Batch search API error:', error)
    
    await ApiAuthMiddleware.logRequest(
      apiKey, 
      request, 
      500, 
      startTime, 
      0, 
      0, 
      error instanceof Error ? error.message : 'Unknown error'
    )

    return NextResponse.json(
      { 
        error: 'Batch search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
      }
    )
  }
}
