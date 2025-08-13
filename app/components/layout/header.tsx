"use client"

import { HistoryTrigger } from "@/app/components/history/history-trigger"
import { AppInfoTrigger } from "@/app/components/layout/app-info/app-info-trigger"
import { ButtonNewChat } from "@/app/components/layout/button-new-chat"
import { UserMenu } from "@/app/components/layout/user-menu"

import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import { InverusIcon } from "@/components/icons/inverus"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { APP_NAME } from "@/lib/config"
import { useUser } from "@/lib/user-store/provider"
import { Info } from "lucide-react"
import Link from "next/link"

export function Header({ hasSidebar }: { hasSidebar: boolean }) {
  const isMobile = useBreakpoint(768)
  const { user } = useUser()

  // A user is truly authenticated if they exist and are not anonymous/guest
  const isAuthenticated = !!user && !user.anonymous && user.id !== "guest"

    return (
    <header className="h-app-header pointer-events-none fixed top-0 right-0 left-0 z-50">
      <div className="relative mx-auto flex h-full max-w-full items-center justify-between bg-transparent px-4 sm:px-6 lg:bg-transparent lg:px-8">
          <div className="flex flex-1 items-center justify-between">
          <div className="-ml-0.5 flex flex-1 items-center gap-2 lg:-ml-2.5">
            <div className="flex flex-1 items-center gap-2">
              <Link
                href="/"
                className="pointer-events-auto inline-flex items-center text-xl font-medium tracking-tight"
              >
                <InverusIcon className="mr-1 size-4" />
                {APP_NAME}
              </Link>
            </div>
          </div>
          <div />
          {!isAuthenticated ? (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-4">
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
              <ThemeToggle variant="button" size="sm" />
              <Button asChild variant="outline" size="sm">
                <Link href="/auth">
              Login
            </Link>
              </Button>
            </div>
          ) : (
            <div className="pointer-events-auto flex flex-1 items-center justify-end gap-2">
              <ButtonNewChat />
              <HistoryTrigger />
              <UserMenu />
            </div>
        )}
        </div>
      </div>
    </header>
  )
}
