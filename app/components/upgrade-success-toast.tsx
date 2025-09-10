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
      
      console.log('🎉 Processing upgrade success:', { tier, tierName })
      
      toast.success(`Upgrade Successful! 🎉`, {
        description: `Welcome to ${tierName}! Your new features are now active.`,
        duration: 5000,
      })
      
      // Aggressive refresh strategy - refresh immediately and multiple times
      console.log('🔄 Starting user refresh sequence...')
      
      // Immediate refresh
      refreshUser().then(() => {
        console.log('✅ Immediate refresh completed')
      }).catch(err => {
        console.error('❌ Immediate refresh failed:', err)
      })
      
      // Additional refreshes with exponential backoff
      setTimeout(() => {
        console.log('🔄 Refresh attempt 1 (1s)')
        refreshUser().then(() => console.log('✅ Refresh 1 completed')).catch(err => console.error('❌ Refresh 1 failed:', err))
      }, 1000)
      
      setTimeout(() => {
        console.log('🔄 Refresh attempt 2 (3s)')
        refreshUser().then(() => console.log('✅ Refresh 2 completed')).catch(err => console.error('❌ Refresh 2 failed:', err))
      }, 3000)
      
      setTimeout(() => {
        console.log('🔄 Refresh attempt 3 (5s)')
        refreshUser().then(() => console.log('✅ Refresh 3 completed')).catch(err => console.error('❌ Refresh 3 failed:', err))
      }, 5000)
      
      setTimeout(() => {
        console.log('🔄 Final refresh attempt (10s)')
        refreshUser().then(() => console.log('✅ Final refresh completed')).catch(err => console.error('❌ Final refresh failed:', err))
      }, 10000)
      
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