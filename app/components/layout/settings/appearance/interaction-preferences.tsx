"use client"

import { Switch } from "@/components/ui/switch"
import { useUserPreferences } from "@/lib/user-preference-store/provider"

export function InteractionPreferences() {
  const { preferences, setShowConversationPreviews } =
    useUserPreferences()

  return (
    <div className="space-y-6">
      {/* Conversation Previews */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Conversation previews</h3>
            <p className="text-muted-foreground text-xs">
              Show conversation previews in history
            </p>
          </div>
          <Switch
            checked={preferences.showConversationPreviews}
            onCheckedChange={setShowConversationPreviews}
          />
        </div>
      </div>
    </div>
  )
}
