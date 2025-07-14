// @todo: move in /lib/user/api.ts
import { UserProfile, type UserTier } from "@/app/types/user"
import { toast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"

export async function fetchUserProfile(
  id: string
): Promise<UserProfile | null> {
  console.log('Fetching user profile for ID:', id)
  const supabase = createClient()
  if (!supabase) {
    console.error('Supabase client not available')
    return null
  }

  // Get both user data from database and auth metadata
  const [dbResult, authResult] = await Promise.all([
    supabase.from("users").select("*").eq("id", id).single(),
    supabase.auth.getUser()
  ])

  const { data, error } = dbResult
  const { data: authData } = authResult

  if (error || !data) {
    console.error("Failed to fetch user:", error)
    return null
  }

  console.log('Raw user data from DB:', {
    id: data.id,
    email: data.email,
    display_name: data.display_name,
    tier: data.tier,
    credits: data.credits,
    anonymous: data.anonymous
  })

  console.log('Auth metadata:', {
    name: authData?.user?.user_metadata?.name,
    avatar_url: authData?.user?.user_metadata?.avatar_url
  })

  // Don't return anonymous users
  if (data.anonymous) {
    console.log('User is anonymous, not returning profile')
    return null
  }

  // Use auth metadata for display name and avatar if database fields are empty
  const authDisplayName = authData?.user?.user_metadata?.name || ""
  const authAvatar = authData?.user?.user_metadata?.avatar_url || ""
  
  const profile = {
    ...data,
    profile_image: data.profile_image || authAvatar,
    display_name: data.display_name || authDisplayName,
    tier: data.tier || "basic", // Default to basic if null
    credits: data.credits || 0, // Default to 0 if null
  }

  // If auth metadata has values but database fields are empty, sync them
  if ((authDisplayName && !data.display_name) || (authAvatar && !data.profile_image)) {
    console.log('Syncing auth metadata to database')
    const updates: any = {}
    if (authDisplayName && !data.display_name) {
      updates.display_name = authDisplayName
    }
    if (authAvatar && !data.profile_image) {
      updates.profile_image = authAvatar
    }
    
    // Update database with auth metadata (don't wait for it)
    supabase.from("users").update(updates).eq("id", id).then(({ error: syncError }) => {
      if (syncError) {
        console.error('Failed to sync auth metadata:', syncError)
      } else {
        console.log('Successfully synced auth metadata to database')
      }
    })
  }

  console.log('Processed user profile:', {
    id: profile.id,
    email: profile.email,
    display_name: profile.display_name,
    tier: profile.tier,
    credits: profile.credits,
    profile_image: profile.profile_image ? 'Yes' : 'No'
  })

  return profile
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase.from("users").update(updates).eq("id", id)

  if (error) {
    console.error("Failed to update user:", error)
    return false
  }

  return true
}

export async function signOutUser(): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) {
    toast({
      title: "Sign out is not supported in this deployment",
      status: "info",
    })
    return false
  }

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Failed to sign out:", error)
    return false
  }

  return true
}

export function subscribeToUserUpdates(
  userId: string,
  onUpdate: (newData: Partial<UserProfile>) => void
) {
  console.log('Setting up real-time subscription for user:', userId)
  const supabase = createClient()
  if (!supabase) {
    console.error('Supabase client not available for subscription')
    return () => {}
  }

  const channel = supabase
    .channel(`public:users:id=eq.${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "users",
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        console.log('Real-time update received:', payload)
        console.log('New data:', payload.new)
        onUpdate(payload.new as Partial<UserProfile>)
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status)
    })

  return () => {
    console.log('Unsubscribing from user updates')
    supabase.removeChannel(channel)
  }
}
