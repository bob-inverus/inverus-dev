import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { USER_TIERS } from '@/app/types/user'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  console.log('🔔 WEBHOOK: Received request')
  console.log('Headers:', Object.fromEntries(request.headers.entries()))
  
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  console.log('Body length:', body.length)
  console.log('Signature present:', !!signature)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ Webhook signature verified successfully')
    console.log('Event type:', event.type)
    console.log('Event ID:', event.id)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('=== WEBHOOK: Processing checkout completion ===')
  console.log('Session ID:', session.id)
  console.log('Session metadata:', session.metadata)
  
  const { userId, tier } = session.metadata!
  
  if (!userId || !tier) {
    console.error('Missing metadata in checkout session:', { userId, tier })
    return
  }

  console.log('Processing upgrade for:', { userId, tier })

  const supabase = createServiceClient()
  if (!supabase) {
    console.error('Supabase service client not available')
    return
  }

  // Validate tier
  if (tier !== 'pro' && tier !== 'enterprise') {
    console.error('Invalid tier:', tier)
    return
  }

  // Update user tier and credits
  const validTier = tier as 'pro' | 'enterprise'
  const newCredits = validTier === 'pro' ? USER_TIERS.pro.credits : USER_TIERS.enterprise.credits
  
  console.log('Updating user with:', { validTier, newCredits })
  
  const { data, error } = await supabase
    .from('users')
    .update({
      tier: validTier,
      credits: newCredits,
    })
    .eq('id', userId)
    .select()

  if (error) {
    console.error('Error updating user tier:', error)
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    throw new Error(`Failed to update user tier: ${error.message}`)
  } else {
    console.log('Database update successful:', data)
    console.log(`User ${userId} upgraded to ${validTier} with ${newCredits} credits`)
    
    // Log successful upgrade for monitoring
    console.log('Successful upgrade:', {
      userId,
      tier: validTier,
      credits: newCredits,
      sessionId: session.id,
      timestamp: new Date().toISOString(),
      updatedRows: data?.length || 0
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata
  
  if (!userId) {
    console.error('Missing userId in subscription metadata')
    return
  }

  const supabase = createServiceClient()
  if (!supabase) {
    console.error('Supabase service client not available')
    return
  }

  // Downgrade user to basic tier
  const { error } = await supabase
    .from('users')
    .update({
      tier: 'basic',
      credits: USER_TIERS.basic.credits,
    })
    .eq('id', userId)

  if (error) {
    console.error('Error downgrading user:', error)
  } else {
    console.log(`User ${userId} downgraded to basic`)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  // You might want to send an email notification here
  console.log(`Payment failed for customer: ${customerId}`)
} 