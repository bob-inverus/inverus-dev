"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle, Crown, Zap } from "lucide-react"
import { useUser } from "@/lib/user-store/provider"

export function UpgradeSuccessToast() {
  const searchParams = useSearchParams()
  const { refreshUser } = useUser()
  
  useEffect(() => {
    const upgraded = searchParams.get('upgraded')
    const tier = searchParams.get('tier')
    const cancelled = searchParams.get('upgrade_cancelled')
    
    if (upgraded === 'true' && tier) {
      const tierName = tier.charAt(0).toUpperCase() + tier.slice(1)
      const icon = tier === 'enterprise' ? '👑' : tier === 'pro' ? '⚡' : '✅'
      
      toast.success(`Upgrade Successful! 🎉`, {
        description: `Welcome to ${tierName}! Your new features are now active.`,
        duration: 5000,
      })
      
      // Refresh user data multiple times to ensure badge updates
      setTimeout(() => refreshUser(), 1000)
      setTimeout(() => refreshUser(), 3000)
      setTimeout(() => refreshUser(), 5000)
      
      // Clean up URL parameters
      const url = new URL(window.location.href)
      url.searchParams.delete('upgraded')
      url.searchParams.delete('tier')
      window.history.replaceState({}, '', url.toString())
    }
    
    if (cancelled === 'true') {
      toast.info("Upgrade cancelled", {
        description: "No charges were made. You can upgrade anytime from your account settings.",
        duration: 4000,
      })
      
      // Clean up URL parameters
      const url = new URL(window.location.href)
      url.searchParams.delete('upgrade_cancelled')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  return null // This component doesn't render anything
} 