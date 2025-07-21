"use client"

import { HistoryTrigger } from "@/app/components/history/history-trigger"
import { AppInfoTrigger } from "@/app/components/layout/app-info/app-info-trigger"
import { ButtonNewChat } from "@/app/components/layout/button-new-chat"

import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import { InverusIcon } from "@/components/icons/inverus"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { APP_NAME } from "@/lib/config"
import { useUser } from "@/lib/user-store/provider"
import { Info } from "lucide-react"
import Link from "next/link"
import { DialogPublish } from "./dialog-publish"

export function Header({ hasSidebar }: { hasSidebar: boolean }) {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()

  const isLoggedIn = !!user

  if (!hasSidebar) {
    return (
      <header className="h-app-header pointer-events-none fixed top-0 right-0 left-0 z-50">
        <div className="relative mx-auto flex h-full max-w-full items-center justify-between bg-transparent px-4 sm:px-6 lg:bg-transparent lg:px-8">
          <div className="flex flex-1 items-center justify-between">
            {/* Logo and APP_NAME on the left */}
            <div className="pointer-events-auto flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <InverusIcon className="size-7" />
                </div>
                <span className="text-foreground text-xl font-medium">{APP_NAME}</span>
              </Link>
            </div>
            
            {!isLoggedIn ? (
              <div className="pointer-events-auto">
                <Link
                  href="/auth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Go to App ↗
                </Link>
              </div>
            ) : (
              <div className="pointer-events-auto flex items-center gap-2">
                <DialogPublish />
                <ButtonNewChat />
                {!hasSidebar && <HistoryTrigger />}
              </div>
            )}
          </div>
        </div>
      </header>
    )
  }

  // Header for sidebar layout
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        {isLoggedIn && (
          <>
            <DialogPublish />
            <ButtonNewChat />
          </>
        )}
        {!isLoggedIn && (
          <>
            <AppInfoTrigger
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background hover:bg-muted text-muted-foreground h-8 w-8 rounded-full"
                  aria-label={`About ${APP_NAME}`}
                >
                  <Info className="size-4" />
                </Button>
              }
            />
            <Link
              href="/auth"
              className="font-base text-muted-foreground hover:text-foreground text-base transition-colors"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
