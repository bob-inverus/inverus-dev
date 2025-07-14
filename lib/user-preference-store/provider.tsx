"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, ReactNode, useContext } from "react"

type UserPreferences = {
  showToolInvocations: boolean
  showConversationPreviews: boolean
  hiddenModels: string[] // Array of model IDs that should be hidden
}

const defaultPreferences: UserPreferences = {
  showToolInvocations: true,
  showConversationPreviews: true,
  hiddenModels: [],
}

const PREFERENCES_STORAGE_KEY = "user-preferences"

interface UserPreferencesContextType {
  preferences: UserPreferences
  setShowToolInvocations: (enabled: boolean) => void
  setShowConversationPreviews: (enabled: boolean) => void
  toggleModelVisibility: (modelId: string) => void
  isModelHidden: (modelId: string) => boolean
}

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined)

export function UserPreferencesProvider({
  children,
  userId,
}: {
  children: ReactNode
  userId?: string
}) {
  const isAuthenticated = !!userId
  const queryClient = useQueryClient()

  const { data: preferences = defaultPreferences } = useQuery<UserPreferences>({
    queryKey: ["user-preferences", userId],
    queryFn: () => {
      if (!isAuthenticated) {
        return defaultPreferences
      }

      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
      if (stored) return JSON.parse(stored)

      return defaultPreferences
    },
    enabled: typeof window !== "undefined",
    staleTime: Infinity,
  })

  const mutation = useMutation({
    mutationFn: async (update: Partial<UserPreferences>) => {
      const updated = { ...preferences, ...update }
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated))
      return updated
    },
    onMutate: async (update) => {
      const queryKey = ["user-preferences", userId]
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<UserPreferences>(queryKey)

      const optimistic = { ...previous, ...update }
      queryClient.setQueryData(queryKey, optimistic)

      return { previous }
    },
    onError: (_err, _update, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user-preferences", userId], context.previous)
      }
    },
  })

  const updatePreferences = mutation.mutate

  const setShowToolInvocations = (enabled: boolean) => {
    updatePreferences({ showToolInvocations: enabled })
  }

  const setShowConversationPreviews = (enabled: boolean) => {
    updatePreferences({ showConversationPreviews: enabled })
  }

  const toggleModelVisibility = (modelId: string) => {
    const currentHidden = preferences.hiddenModels || []
    const isHidden = currentHidden.includes(modelId)
    const newHidden = isHidden
      ? currentHidden.filter((id) => id !== modelId)
      : [...currentHidden, modelId]

    updatePreferences({ hiddenModels: newHidden })
  }

  const isModelHidden = (modelId: string) => {
    return (preferences.hiddenModels || []).includes(modelId)
  }

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        setShowToolInvocations,
        setShowConversationPreviews,
        toggleModelVisibility,
        isModelHidden,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error(
      "useUserPreferences must be used within UserPreferencesProvider"
    )
  }
  return context
}
