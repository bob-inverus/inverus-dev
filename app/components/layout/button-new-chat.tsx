"use client"

import { useKeyShortcut } from "@/app/hooks/use-key-shortcut"
import { useChats } from "@/lib/chat-store/chats/provider"
import { useUser } from "@/lib/user-store/provider"
import { usePathname, useRouter } from "next/navigation"
import { Edit } from "lucide-react"

export function ButtonNewChat() {
  const pathname = usePathname()
  const router = useRouter()
  const { createNewChat } = useChats()
  const { user } = useUser()

  const handleNewChat = async () => {
    if (!user?.id) {
      router.push("/")
      return
    }
    
    try {
      const newChat = await createNewChat(user.id)
      if (newChat) {
        router.push(`/c/${newChat.id}`)
      }
    } catch (error) {
      console.error("Failed to create new chat:", error)
      router.push("/")
    }
  }

  useKeyShortcut(
    (e) => (e.key === "u" || e.key === "U") && e.metaKey && e.shiftKey,
    handleNewChat
  )

  if (pathname === "/") return null
  
  return (
    <a
      tabIndex={0}
      className="group cursor-pointer flex items-center justify-between w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
      data-testid="create-new-chat-button"
      onClick={handleNewChat}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleNewChat()
        }
      }}
    >
              <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex items-center justify-center group-disabled:opacity-50 group-data-disabled:opacity-50">
            <Edit className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 grow items-center gap-2">
            <div className="truncate">New chat</div>
          </div>
        </div>
              <div className="text-muted-foreground flex items-center self-stretch">
          <div className="trailing highlight">
            <div className="touch:hidden text-xs">⌘⇧U</div>
          </div>
        </div>
    </a>
  )
}
