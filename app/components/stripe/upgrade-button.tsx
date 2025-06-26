"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/user-store/provider"
import { getStripe, STRIPE_CONFIG } from "@/lib/stripe/config"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type UpgradeButtonProps = {
  tier: 'pro' | 'enterprise'
  priceId?: string
  children: React.ReactNode
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
}

export function UpgradeButton({ 
  tier, 
  priceId, 
  children, 
  variant = "default",
  size = "default",
  className,
  disabled = false
}: UpgradeButtonProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please log in to upgrade your plan")
      return
    }

    setIsLoading(true)

    try {
      // Use provided priceId or default from config
      const selectedPriceId = priceId || 
        (tier === 'pro' ? STRIPE_CONFIG.PRO_PRICE_ID : STRIPE_CONFIG.ENTERPRISE_PRICE_ID)

      // Check if price ID is configured (default values are placeholders)
      if (!selectedPriceId || selectedPriceId === 'price_pro_monthly' || selectedPriceId === 'price_enterprise_monthly') {
        throw new Error(`${tier === 'pro' ? 'Pro' : 'Enterprise'} price ID not configured. Please set up Stripe products and update environment variables.`)
      }

      console.log('Creating checkout session for:', { selectedPriceId, tier })

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPriceId,
          tier: tier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Checkout session creation failed:', data)
        const errorMessage = data.details || data.error || 'Failed to create checkout session'
        throw new Error(errorMessage)
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe failed to load. Please check your internet connection and Stripe configuration.')
      }

      console.log('Redirecting to Stripe checkout with session:', data.sessionId)

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        console.error('Stripe redirect error:', error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start upgrade process')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleUpgrade}
      disabled={disabled || isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
} 