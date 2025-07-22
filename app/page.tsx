import { LayoutApp } from "@/app/components/layout/layout-app"
import { ChatLandingWindow } from "@/app/components/chat-landing-window"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <LayoutApp>
      <ChatLandingWindow />
    </LayoutApp>
  )
}
