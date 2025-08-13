"use client"

import { Header } from "@/app/components/layout/header"

export function LayoutApp({ children }: { children: React.ReactNode }) {
  const hasSidebar = false

    return (
      <div className="bg-background flex h-dvh w-full overflow-hidden">
        <main className="@container relative h-dvh w-0 flex-shrink flex-grow overflow-y-auto">
        <Header hasSidebar={hasSidebar} />
          {children}
        </main>
      </div>
  )
}
