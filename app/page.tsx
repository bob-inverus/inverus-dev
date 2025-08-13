import { LayoutApp } from "@/app/components/layout/layout-app"
import { Chat } from "@/app/components/chat/chat"
import { MessagesProvider } from "@/lib/chat-store/messages/provider"

export const dynamic = "force-dynamic"

export default async function Home() {
  return (
    <MessagesProvider>
      <LayoutApp>
        <Chat />
      </LayoutApp>
    </MessagesProvider>
  )
}
