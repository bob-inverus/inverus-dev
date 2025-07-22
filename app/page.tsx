import { LayoutApp } from "@/app/components/layout/layout-app"
import { ChatLandingWindow } from "@/app/components/chat-landing-window"
import { Chat } from "@/app/components/chat/chat"
import { MessagesProvider } from "@/lib/chat-store/messages/provider"
import { getUserProfile } from "@/lib/user/api"

export const dynamic = "force-dynamic"

export default async function Home() {
  const userProfile = await getUserProfile()
  const isAuthenticated = !!userProfile?.id

  return (
    <MessagesProvider>
      <LayoutApp>
        {isAuthenticated ? <Chat /> : <ChatLandingWindow />}
      </LayoutApp>
    </MessagesProvider>
  )
}
