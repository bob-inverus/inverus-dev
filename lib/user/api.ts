import type { UserProfile } from "@/app/types/user";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { USER_TIERS } from "@/app/types/user";

export async function getSupabaseUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };

  const { data } = await supabase.auth.getUser();
  return {
    supabase,
    user: data.user ?? null,
  };
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (!isSupabaseEnabled) {
    // return fake user profile for no supabase
    return {
      id: "guest",
      email: "guest@inVerus.chat",
      display_name: "Guest",
      profile_image: "",
      anonymous: true,
    } as UserProfile;
  }

  const { supabase, user } = await getSupabaseUser();
  if (!supabase || !user) return null;

  const { data: userProfileData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Don't load anonymous users in the user store
  if (userProfileData?.anonymous) return null;

  if (!userProfileData) return null;

  // Initialize default tier and credits if not set
  let finalUserData = userProfileData;
  if (!userProfileData.tier || userProfileData.credits === null) {
    const defaultTier = "basic" as const;
    const defaultCredits = USER_TIERS.basic.credits;
    
    const { error: updateError } = await supabase
      .from("users")
      .update({
        tier: userProfileData.tier || defaultTier,
        credits: userProfileData.credits ?? defaultCredits,
      })
      .eq("id", user.id);

    if (!updateError) {
      finalUserData = {
        ...userProfileData,
        tier: userProfileData.tier || defaultTier,
        credits: userProfileData.credits ?? defaultCredits,
      };
    }
  }

  return {
    ...finalUserData,
    profile_image: user.user_metadata?.avatar_url ?? "",
    display_name: user.user_metadata?.name ?? "",
  } as UserProfile;
}
