import type { Tables } from "@/app/types/database.types"

// User tier types
export type UserTier = "basic" | "pro" | "enterprise"

export type UserTierInfo = {
  name: string
  credits: number
  features: string[]
  isCustomCredits?: boolean
}

export type UserProfile = {
  profile_image: string
  display_name: string
  tier?: UserTier
  credits?: number
} & Tables<"users">

// User tier configurations
export const USER_TIERS: Record<UserTier, UserTierInfo> = {
  basic: {
    name: "Basic",
    credits: 50,
    features: [
      "Basic chat functionality",
      "50 credits per month",
      "Community support"
    ]
  },
  pro: {
    name: "Pro", 
    credits: 500,
    features: [
      "All Basic features",
      "500 credits per month",
      "Premium models access",
      "Priority support",
      "Advanced features"
    ]
  },
  enterprise: {
    name: "Enterprise",
    credits: 0, // Will be set custom
    isCustomCredits: true,
    features: [
      "All Pro features",
      "Custom credit allocation",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantees"
    ]
  }
}
