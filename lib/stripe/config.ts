import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined')
      return Promise.resolve(null)
    }
    
    if (!publishableKey.startsWith('pk_')) {
      console.error('Invalid Stripe publishable key format. Should start with "pk_"')
      return Promise.resolve(null)
    }
    
    console.log('Loading Stripe with key:', publishableKey.substring(0, 10) + '...')
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

export const STRIPE_CONFIG = {
  PRO_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  ENTERPRISE_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
  CURRENCY: 'usd',
} as const

export const formatPrice = (amount: number, currency: string = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
} 