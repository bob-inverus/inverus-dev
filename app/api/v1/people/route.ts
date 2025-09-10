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
  const authResult = await ApiAuthMiddleware.authenticate(request, API_PERMISSIONS.PEOPLE)
  
  if (!authResult.success) {
    return authResult.response!
  }

  const { apiKey, user } = authResult.request!

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!email && !name) {
      await ApiAuthMiddleware.logRequest(apiKey, request, 400, startTime, 0, 0, 'Missing search parameters')
      return NextResponse.json(
        { 
          error: 'Missing search parameters',
          message: 'Include either ?email= or ?name= parameter'
        },
        { 
          status: 400,
          headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
        }
      )
    }

    // Search people database
    const supabase = createServiceClient()
    if (!supabase) {
      throw new Error('Database connection failed')
    }

    let query = supabase
      .from('people_db')
      .select(`
        id,
        "Name",
        "Email", 
        "First_name",
        "Last_name",
        "Mobile Phone",
        "Address",
        city,
        state,
        "Status",
        "Is Valid",
        created_at
      `)

    if (email) {
      query = query.eq('Email', email)
    } else if (name) {
      query = query.or(`Name.ilike.%${name}%,First_name.ilike.%${name}%,Last_name.ilike.%${name}%`)
    }

    const { data: results, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`People search failed: ${error.message}`)
    }

    // Calculate credits consumed (example: 0.2 credits per people search)
    const creditsConsumed = 0.2

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
        search_params: { email, name },
        response_time_ms: Date.now() - startTime,
        credits_consumed: creditsConsumed
      }
    }

    return NextResponse.json(response, {
      headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
    })

  } catch (error) {
    console.error('People API error:', error)
    
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
        error: 'People search failed',
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
  const authResult = await ApiAuthMiddleware.authenticate(request, API_PERMISSIONS.PEOPLE)
  
  if (!authResult.success) {
    return authResult.response!
  }

  const { apiKey, user } = authResult.request!

  try {
    const body = await request.json()
    const { people, enrich = false } = body

    if (!people || !Array.isArray(people) || people.length === 0) {
      await ApiAuthMiddleware.logRequest(apiKey, request, 400, startTime, 0, 0, 'Missing or invalid people array')
      return NextResponse.json(
        { 
          error: 'Invalid request',
          message: 'Include "people" array with email/name objects in request body'
        },
        { 
          status: 400,
          headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
        }
      )
    }

    // Limit batch size based on tier
    const maxBatchSize = user.tier === 'enterprise' ? 100 : 25
    if (people.length > maxBatchSize) {
      await ApiAuthMiddleware.logRequest(apiKey, request, 400, startTime, 0, 0, `Batch size limit exceeded: ${people.length} > ${maxBatchSize}`)
      return NextResponse.json(
        { 
          error: 'Batch size limit exceeded',
          message: `Maximum ${maxBatchSize} people allowed per request for ${user.tier} tier`
        },
        { 
          status: 400,
          headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
        }
      )
    }

    // Process batch people lookup
    const supabase = createServiceClient()
    if (!supabase) {
      throw new Error('Database connection failed')
    }

    const results = await Promise.all(
      people.map(async (person: { email?: string, name?: string }) => {
        if (!person.email && !person.name) {
          return { 
            input: person, 
            error: 'Missing email or name', 
            data: null 
          }
        }

        let query = supabase
          .from('people_db')
          .select(`
            id,
            "Name",
            "Email", 
            "First_name",
            "Last_name",
            "Mobile Phone",
            "Address",
            city,
            state,
            "Status",
            "Is Valid",
            created_at
          `)

        if (person.email) {
          query = query.eq('Email', person.email)
        } else if (person.name) {
          query = query.or(`Name.ilike.%${person.name}%,First_name.ilike.%${person.name}%,Last_name.ilike.%${person.name}%`)
        }

        const { data, error } = await query.limit(5)

        if (error) {
          return { 
            input: person, 
            error: error.message, 
            data: null 
          }
        }

        // If enrichment is requested and we have Pro/Enterprise, add more data
        let enrichedData = data
        if (enrich && user.tier !== 'basic' && data && data.length > 0) {
          // Add enrichment logic here (social profiles, additional data, etc.)
          // This is where you'd integrate with your crawler or other data sources
        }

        return { 
          input: person, 
          data: enrichedData, 
          error: null,
          enriched: enrich && user.tier !== 'basic'
        }
      })
    )

    // Calculate credits consumed (example: 0.1 credits per person, 0.3 if enriched)
    const creditsPerPerson = enrich ? 0.3 : 0.1
    const creditsConsumed = people.length * creditsPerPerson

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
        people_processed: people.length,
        enrichment_enabled: enrich,
        response_time_ms: Date.now() - startTime,
        credits_consumed: creditsConsumed
      }
    }

    return NextResponse.json(response, {
      headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
    })

  } catch (error) {
    console.error('Batch people API error:', error)
    
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
        error: 'Batch people lookup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: ApiAuthMiddleware.createCORSHeaders(apiKey.allowed_origins)
      }
    )
  }
}
