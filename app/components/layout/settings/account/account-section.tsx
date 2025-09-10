"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/lib/user-store/provider"
import { USER_TIERS, type UserTier } from "@/app/types/user"
import { BadgeCheck, Crown, Zap, Building, Mail, ChevronDown } from "lucide-react"
import { UpgradeButton } from "@/app/components/stripe/upgrade-button"
import { DowngradeButton } from "@/app/components/stripe/downgrade-button"

export function AccountSection() {
  const { user } = useUser()

  // Default to basic tier if not set
  const userTier: UserTier = user?.tier || "basic"
  const userCredits = user?.credits || USER_TIERS.basic.credits
  const tierInfo = USER_TIERS[userTier]

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case "enterprise":
        return <Crown className="size-4 text-yellow-500" />
      case "pro":
        return <Zap className="size-4 text-purple-500" />
      default:
        return <BadgeCheck className="size-4 text-blue-500" />
    }
  }

  const getTierBadgeVariant = (tier: UserTier) => {
    switch (tier) {
      case "enterprise":
        return "default" // Gold-ish
      case "pro":
        return "secondary" // Purple-ish
      default:
        return "outline" // Basic
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and usage
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTierIcon(userTier)}
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{tierInfo.name} Plan</span>
              <Badge variant={getTierBadgeVariant(userTier)}>
                {tierInfo.name}
              </Badge>
            </div>
            <div className="flex gap-2">
              {userTier !== "enterprise" && (
                <UpgradeButton 
                  tier={userTier === "basic" ? "pro" : "enterprise"}
                  size="sm" 
                  variant="outline"
                >
                  {userTier === "basic" ? "Upgrade to Pro" : "Upgrade to Enterprise"}
                </UpgradeButton>
              )}
              {userTier !== "basic" && (
                <DowngradeButton 
                  targetTier={userTier === "enterprise" ? "pro" : "basic"}
                  size="sm"
                  variant="outline"
                >
                  <ChevronDown className="mr-1 size-3" />
                  {userTier === "enterprise" ? "Change to Pro" : "Change to Basic"}
                </DowngradeButton>
              )}
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credits</span>
              <span className="text-sm font-medium">
                {userCredits} {tierInfo.isCustomCredits ? "" : `/ ${tierInfo.credits}`}
              </span>
            </div>
            {!tierInfo.isCustomCredits && (
              <Progress 
                value={(userCredits / tierInfo.credits) * 100} 
                className="h-2"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            What's included in your {tierInfo.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tierInfo.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <BadgeCheck className="size-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Available Upgrades */}
      {userTier !== "enterprise" && (
        <Card>
          <CardHeader>
            <CardTitle>Available Upgrades</CardTitle>
            <CardDescription>
              Unlock more features with a higher tier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(USER_TIERS)
              .filter(([tier]) => {
                if (userTier === "basic") return tier === "pro" || tier === "enterprise"
                if (userTier === "pro") return tier === "enterprise"
                return false
              })
              .map(([tier, info]) => (
                <div key={tier} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getTierIcon(tier as UserTier)}
                    <div>
                      <div className="font-medium">{info.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {info.isCustomCredits ? "Custom credits" : `${info.credits} credits`}
                      </div>
                    </div>
                  </div>
                  {tier === "enterprise" ? (
                    <UpgradeButton 
                      tier="enterprise"
                      size="sm"
                    >
                      <Mail className="mr-2 size-4" />
                      Contact Sales
                    </UpgradeButton>
                  ) : (
                    <UpgradeButton 
                      tier={tier as 'pro'}
                      size="sm"
                    >
                      Upgrade
                    </UpgradeButton>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Plan Management */}
      {userTier !== "basic" && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Management</CardTitle>
            <CardDescription>
              Change your plan to better fit your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(USER_TIERS)
              .filter(([tier]) => {
                if (userTier === "enterprise") return tier === "pro" || tier === "basic"
                if (userTier === "pro") return tier === "basic"
                return false
              })
              .map(([tier, info]) => (
                <div key={tier} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getTierIcon(tier as UserTier)}
                    <div>
                      <div className="font-medium">{info.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {info.isCustomCredits ? "Custom credits" : `${info.credits} credits`}
                      </div>
                    </div>
                  </div>
                  <DowngradeButton 
                    targetTier={tier as UserTier}
                    size="sm"
                    variant="outline"
                  >
                    <ChevronDown className="mr-1 size-3" />
                    Change Plan
                  </DowngradeButton>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 