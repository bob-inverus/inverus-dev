// app/providers/user-provider.tsx
"use client"

import { UserProfile } from "@/app/types/user"
import {
  fetchUserProfile,
  signOutUser,
  subscribeToUserUpdates,
  updateUserProfile,
} from "@/lib/user-store/api"
import { createContext, useContext, useEffect, useState } from "react"

type UserContextType = {
  user: UserProfile | null
  isLoading: boolean
  updateUser: (updates: Partial<UserProfile>) => Promise<void>
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: UserProfile | null
}) {
  const [user, setUser] = useState<UserProfile | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)

  const refreshUser = async () => {
    if (!user?.id) {
      console.log('❌ RefreshUser: No user ID available')
      return
    }

    console.log('🔄 RefreshUser: Starting refresh for user:', user.id)
    console.log('🔄 RefreshUser: Current user tier:', user.tier)
    
    setIsLoading(true)
    try {
      const updatedUser = await fetchUserProfile(user.id)
      if (updatedUser) {
        console.log('✅ RefreshUser: Got updated user data:', {
          id: updatedUser.id,
          tier: updatedUser.tier,
          credits: updatedUser.credits
        })
        
        // Check if tier actually changed
        if (user.tier !== updatedUser.tier) {
          console.log('🎉 RefreshUser: Tier changed!', {
            oldTier: user.tier,
            newTier: updatedUser.tier
          })
        } else {
          console.log('⚠️ RefreshUser: Tier unchanged:', updatedUser.tier)
        }
        
        setUser(updatedUser)
      } else {
        console.log('❌ RefreshUser: No updated user data received')
      }
    } catch (error) {
      console.error('❌ RefreshUser: Error during refresh:', error)
    } finally {
      setIsLoading(false)
      console.log('🔄 RefreshUser: Refresh completed')
    }
  }

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const success = await updateUserProfile(user.id, updates)
      if (success) {
        setUser((prev) => (prev ? { ...prev, ...updates } : null))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      const success = await signOutUser()
      if (success) setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Set up realtime subscription for user data changes
  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = subscribeToUserUpdates(user.id, (newData) => {
      setUser((prev) => (prev ? { ...prev, ...newData } : null))
    })

    return () => {
      unsubscribe()
    }
  }, [user?.id])

  return (
    <UserContext.Provider
      value={{ user, isLoading, updateUser, refreshUser, signOut }}
    >
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
