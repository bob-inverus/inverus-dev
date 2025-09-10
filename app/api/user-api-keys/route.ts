import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiKeyService } from '@/lib/api-keys/service'
import { CreateApiKeyRequest, API_PERMISSIONS } from '@/lib/api-keys/types'
import { UserTier } from '@/app/types/user'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check tier
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (userProfile.tier === 'basic') {
      return NextResponse.json(
        { error: 'API access requires Pro or Enterprise tier' }, 
        { status: 403 }
      )
    }

    const apiKeys = await ApiKeyService.getApiKeys(user.id)
    const usageStats = await ApiKeyService.getUsageStats(user.id)

    console.log('GET /api/user-api-keys - User ID:', user.id) // Debug log
    console.log('GET /api/user-api-keys - API Keys found:', apiKeys.length) // Debug log
    console.log('GET /api/user-api-keys - API Keys data:', apiKeys) // Debug log

    return NextResponse.json({
      apiKeys,
      usageStats,
      tierLimits: {
        tier: userProfile.tier,
        maxKeys: userProfile.tier === 'enterprise' ? 10 : 3
      }
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check tier
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (userProfile.tier === 'basic') {
      return NextResponse.json(
        { error: 'API access requires Pro or Enterprise tier' }, 
        { status: 403 }
      )
    }

    const body: CreateApiKeyRequest = await request.json()

    // Validate request
    if (!body.key_name || !body.permissions) {
      return NextResponse.json(
        { error: 'Missing required fields: key_name, permissions' },
        { status: 400 }
      )
    }

    // Validate permissions
    const validPermissions = Object.values(API_PERMISSIONS)
    const invalidPermissions = body.permissions.filter(p => !validPermissions.includes(p as any))
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid permissions',
          invalidPermissions,
          validPermissions
        },
        { status: 400 }
      )
    }

    // Create API key
    console.log('POST /api/user-api-keys - Creating API key for user:', user.id) // Debug log
    console.log('POST /api/user-api-keys - Request body:', body) // Debug log

    const result = await ApiKeyService.createApiKey(
      user.id, 
      body, 
      userProfile.tier as UserTier
    )

    console.log('POST /api/user-api-keys - Creation result:', result ? 'success' : 'failed') // Debug log
    if (result) {
      console.log('POST /api/user-api-keys - Created key ID:', result.apiKey.id) // Debug log
      console.log('POST /api/user-api-keys - Created key data:', result.apiKey) // Debug log
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'API key created successfully',
      apiKey: {
        ...result.apiKey,
        // Don't return the hash
        key_hash: undefined
      },
      secretKey: result.secretKey,
      warning: 'Save this secret key securely. It will not be shown again.'
    })

  } catch (error) {
    console.error('Error creating API key:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyId, key_name, is_active } = body

    if (!keyId) {
      return NextResponse.json(
        { error: 'Missing keyId' },
        { status: 400 }
      )
    }

    // Handle rename
    if (key_name !== undefined) {
      if (!key_name.trim()) {
        return NextResponse.json(
          { error: 'Key name cannot be empty' },
          { status: 400 }
        )
      }

      const { error } = await supabase
        .from('api_keys')
        .update({ key_name: key_name.trim() })
        .eq('id', keyId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error renaming API key:', error)
        return NextResponse.json(
          { error: 'Failed to rename API key' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'API key renamed successfully'
      })
    }

    // Handle enable/disable
    if (is_active !== undefined) {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active })
        .eq('id', keyId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating API key status:', error)
        return NextResponse.json(
          { error: 'Failed to update API key status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: `API key ${is_active ? 'enabled' : 'disabled'} successfully`
      })
    }

    return NextResponse.json(
      { error: 'No valid update fields provided' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyId } = body

    if (!keyId) {
      return NextResponse.json(
        { error: 'Missing keyId' },
        { status: 400 }
      )
    }

    // Get user profile to check tier
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile || !userProfile.tier) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get the existing key to preserve its settings
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('key_name, permissions, allowed_origins, expires_at')
      .eq('id', keyId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Generate new key
    const result = await ApiKeyService.createApiKey(user.id, {
      key_name: existingKey.key_name,
      permissions: existingKey.permissions,
      allowed_origins: existingKey.allowed_origins || undefined,
      expires_at: existingKey.expires_at
    }, userProfile.tier)

    if (!result || !result.secretKey) {
      return NextResponse.json(
        { error: 'Failed to regenerate API key' },
        { status: 500 }
      )
    }

    // Deactivate the old key
    await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', user.id)

    return NextResponse.json({
      message: 'API key regenerated successfully',
      secretKey: result.secretKey,
      keyId: result.apiKey.id
    })

  } catch (error) {
    console.error('Error regenerating API key:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate API key' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyId } = body

    if (!keyId) {
      return NextResponse.json(
        { error: 'Missing keyId' },
        { status: 400 }
      )
    }

    const success = await ApiKeyService.deactivateApiKey(user.id, keyId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to deactivate API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'API key deactivated successfully'
    })

  } catch (error) {
    console.error('Error deactivating API key:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate API key' },
      { status: 500 }
    )
  }
}
