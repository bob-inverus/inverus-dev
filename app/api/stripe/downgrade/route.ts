import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { USER_TIERS, type UserTier } from "@/app/types/user"

export async function POST(request: NextRequest) {
  try {
    const { userId, targetTier } = await request.json()

    // Validate input
    if (!userId || !targetTier) {
      return NextResponse.json(
        { error: "Missing userId or targetTier" },
        { status: 400 }
      )
    }

    // Validate target tier
    if (!USER_TIERS[targetTier as UserTier]) {
      return NextResponse.json(
        { error: "Invalid target tier" },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    if (!supabase) {
      console.error('Failed to create Supabase service client - missing environment variables')
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      )
    }

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('id, tier, credits')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      )
    }

    const currentTier: UserTier = currentUser.tier || "basic"
    const validTargetTier = targetTier as UserTier

    // Validate downgrade logic
    if (currentTier === "basic") {
      return NextResponse.json(
        { error: "Cannot downgrade from Basic tier" },
        { status: 400 }
      )
    }

    if (currentTier === "pro" && validTargetTier === "enterprise") {
      return NextResponse.json(
        { error: "Cannot 'downgrade' from Pro to Enterprise" },
        { status: 400 }
      )
    }

    if (currentTier === validTargetTier) {
      return NextResponse.json(
        { error: `Already on ${validTargetTier} tier` },
        { status: 400 }
      )
    }

    // Calculate new credits
    const targetTierInfo = USER_TIERS[validTargetTier]
    const newCredits = targetTierInfo.isCustomCredits ? currentUser.credits : targetTierInfo.credits

    console.log('Processing downgrade:', {
      userId,
      currentTier,
      targetTier: validTargetTier,
      newCredits
    })

    // Update user tier and credits
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        tier: validTargetTier,
        credits: newCredits,
        last_active_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (updateError) {
      console.error('Error updating user tier:', updateError)
      return NextResponse.json(
        { error: "Failed to update user tier" },
        { status: 500 }
      )
    }

    console.log('Downgrade successful:', {
      userId,
      oldTier: currentTier,
      newTier: validTargetTier,
      newCredits,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      user: updatedUser[0],
      message: `Successfully changed to ${targetTierInfo.name}`
    })

  } catch (error) {
    console.error('Downgrade API error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
