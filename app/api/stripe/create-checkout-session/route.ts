import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { STRIPE_CONFIG } from '@/lib/stripe/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const { priceId, tier } = await request.json()
    
    if (!priceId || !tier) {
      return NextResponse.json({ error: 'Missing priceId or tier' }, { status: 400 })
    }
    
    console.log('Creating checkout session for:', { priceId, tier })
    
    // Get the authenticated user
    const supabase = await createClient()
    if (!supabase) {
      console.error('Failed to create Supabase client')
      return NextResponse.json({ error: 'Supabase not available' }, { status: 500 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    if (!user) {
      console.error('No user found in session')
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 })
    }

    console.log('Authenticated user:', user.id)

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }
    if (!userProfile) {
      console.error('User profile not found for user:', user.id)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    console.log('Found user profile:', userProfile.email)

    // Check if required URLs are configured
    if (!process.env.NEXT_PUBLIC_VERCEL_URL) {
      console.error('NEXT_PUBLIC_VERCEL_URL not configured')
      return NextResponse.json({ error: 'App URL not configured' }, { status: 500 })
    }

    console.log('Creating Stripe session with config:', {
      email: userProfile.email,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_VERCEL_URL}?upgraded=true&tier=${tier}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_VERCEL_URL}?upgrade_cancelled=true`
    })

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userProfile.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_VERCEL_URL}?upgraded=true&tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_VERCEL_URL}?upgrade_cancelled=true`,
      metadata: {
        userId: user.id,
        tier: tier,
        currentTier: userProfile.tier || 'basic',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: tier,
        },
      },
    })

    console.log('Stripe session created successfully:', session.id)

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    // Provide more specific error information
    let errorMessage = 'Failed to create checkout session'
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
} 