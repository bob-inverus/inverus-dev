"use client"

import { Header } from "@/app/components/layout/header"
import { AppSidebar } from "@/app/components/layout/sidebar/app-sidebar"
import { useUser } from "@/lib/user-store/provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function LayoutApp({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const isLoggedIn = !!user

  // For non-authenticated users, show fullscreen layout without sidebar
  if (!isLoggedIn) {
    return (
      <div className="bg-background flex h-dvh w-full overflow-hidden">
        <main className="@container relative h-dvh w-0 flex-shrink flex-grow overflow-y-auto">
          <Header hasSidebar={false} />
          {children}
        </main>
      </div>
    )
  }

  // For authenticated users, always show sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header hasSidebar={true} />
        <main className="@container relative flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
