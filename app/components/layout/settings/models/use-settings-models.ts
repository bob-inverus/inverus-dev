"use client"

import { fetchClient } from "@/lib/fetch"
import { ModelConfig } from "@/lib/models/types"
import { useCallback, useEffect, useState } from "react"

export function useSettingsModels() {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetchClient("/api/models/settings")
      if (response.ok) {
        const data = await response.json()
        setModels(data.models || [])
      }
    } catch (error) {
      console.error("Failed to fetch settings models:", error)
    }
  }, [])

  const refreshModels = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetchModels()
    } finally {
      setIsLoading(false)
    }
  }, [fetchModels])

  // Initial data fetch
  useEffect(() => {
    refreshModels()
  }, []) // Only run once on mount

  return {
    models,
    isLoading,
    refreshModels,
  }
}
