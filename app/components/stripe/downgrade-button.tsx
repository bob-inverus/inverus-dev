"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { useUser } from "@/lib/user-store/provider"
import { USER_TIERS, type UserTier } from "@/app/types/user"
import { Loader2, Info } from "lucide-react"
import { toast } from "sonner"

type DowngradeButtonProps = {
  targetTier: UserTier
  children?: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
}

export function DowngradeButton({ 
  targetTier, 
  children = "Downgrade",
  variant = "outline",
  size = "default",
  className,
  disabled = false
}: DowngradeButtonProps) {
  const { user, refreshUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const currentTier: UserTier = user?.tier || "basic"
  const targetTierInfo = USER_TIERS[targetTier]
  const currentTierInfo = USER_TIERS[currentTier]

  // Don't show downgrade if user is already at target tier or lower
  if (currentTier === targetTier || 
      (currentTier === "basic") ||
      (currentTier === "pro" && targetTier === "enterprise")) {
    return null
  }

  const handleDowngrade = async () => {
    if (!user?.id) {
      toast.error("User not authenticated")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          targetTier: targetTier
        }),
      })

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      let data: any = {}
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        // If not JSON, get text for debugging
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error('Server returned an invalid response')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to downgrade')
      }

      // Refresh user data to get updated tier
      await refreshUser()
      
      toast.success(`Successfully changed to ${targetTierInfo.name} plan!`, {
        description: `You now have ${targetTierInfo.credits} credits per month.`
      })

    } catch (error) {
      console.error('Downgrade error:', error)
      toast.error('Failed to change plan', {
        description: error instanceof Error ? error.message : 'Please try again or contact support.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFeatureDifferences = () => {
    const currentFeatures = currentTierInfo.features
    const targetFeatures = targetTierInfo.features
    
    // Features that will be lost
    const lostFeatures = currentFeatures.filter(feature => 
      !targetFeatures.some(targetFeature => 
        targetFeature.toLowerCase().includes(feature.toLowerCase().split(' ')[0])
      )
    )

    return lostFeatures
  }

  const lostFeatures = getFeatureDifferences()
  const creditDifference = currentTierInfo.credits - targetTierInfo.credits

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          className={className}
          disabled={disabled || isLoading}
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {children}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Info className="size-5 text-muted-foreground" />
            Confirm Plan Change
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-3">
            <div>
              You're about to change from <strong>{currentTierInfo.name}</strong> to <strong>{targetTierInfo.name}</strong>.
            </div>
            
            {creditDifference > 0 && (
              <div className="p-3 bg-muted rounded-lg border">
                <div className="text-sm font-medium">
                  Credit Change
                </div>
                <div className="text-sm text-muted-foreground">
                  Your monthly credits will change from <strong>{currentTierInfo.credits}</strong> to <strong>{targetTierInfo.credits}</strong> 
                  (a reduction of {creditDifference} credits).
                </div>
              </div>
            )}

            {lostFeatures.length > 0 && (
              <div className="p-3 bg-muted rounded-lg border">
                <div className="text-sm font-medium mb-2">
                  Features That Will Be Removed:
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {lostFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span>•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              This change will take effect immediately. You can upgrade again at any time.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDowngrade}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Confirm Change
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
