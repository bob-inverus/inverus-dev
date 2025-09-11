"use client"

import { useUser } from "@/lib/user-store/provider"
import { useState } from "react"
import { CustomModelSelector } from "./custom-model-selector"
import { SystemPromptSection } from "./system-prompt"

export function ModelPreferences() {
  const { user, updateUser } = useUser()
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)

  // Map existing preferred models to our custom options, default to harvestor
  const getEffectiveModelId = () => {
    const userPreferredModel = selectedModelId ?? user?.preferred_model
    
    // Map existing model IDs to our custom options
    if (userPreferredModel === "consortium" || userPreferredModel?.includes("consortium")) {
      return "consortium"
    }
    
    // Default to harvestor for any other model or no model
    return "harvestor"
  }

  const effectiveModelId = getEffectiveModelId()

  const handleModelSelection = async (value: string) => {
    setSelectedModelId(value)
    await updateUser({ preferred_model: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Preferred model</h3>
        <CustomModelSelector
          selectedModelId={effectiveModelId}
          onModelChange={handleModelSelection}
          className="w-full"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          This model will be used by default for new conversations.
        </p>
      </div>

      <SystemPromptSection />
    </div>
  )
}
