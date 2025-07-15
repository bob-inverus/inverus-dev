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
      const newChat = await createNewChat(user.id, undefined, undefined, true)
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
    <button
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 size-9 text-muted-foreground hover:text-foreground hover:bg-muted bg-background rounded-full p-1.5 transition-colors"
      data-testid="create-new-chat-button"
      onClick={handleNewChat}
      title="New chat (⌘⇧U)"
    >
      <Edit className="size-5" />
      <span className="sr-only">New chat</span>
    </button>
  )
}
