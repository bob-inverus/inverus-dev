"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
  Info,
  MessageCircle,
  Crown,
  Zap,
  BookOpen,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useUser } from "@/lib/user-store/provider"
import { useState } from "react"
import { SettingsTrigger } from "../settings/settings-trigger"
import { FeedbackTrigger } from "../feedback/feedback-trigger"
import { AppInfoTrigger } from "../app-info/app-info-trigger"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { SettingsContent } from "../settings/settings-content"
import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import { USER_TIERS, type UserTier } from "@/app/types/user"

export function AppNavUser() {
  const { isMobile } = useSidebar()
  const { user, signOut } = useUser()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<"general" | "appearance" | "account" | "models" | "connections">("general")
  const isMobileBreakpoint = useBreakpoint(768)

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to home page
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  const handleUpgradeToPro = () => {
    setSettingsTab("account")
    setSettingsOpen(true)
  }

  const handleCloseSettings = () => {
    setSettingsOpen(false)
    setSettingsTab("general") // Reset to default tab
  }

  const userTier: UserTier = user?.tier || "basic"
  
  const getTierIcon = () => {
    switch (userTier) {
      case "enterprise":
        return <Crown className="size-3 text-yellow-600" />
      case "pro":
        return <Zap className="size-3 text-blue-600" />
      default:
        return <BadgeCheck className="size-3 text-gray-500" />
    }
  }

  const getTierBadgeVariant = () => {
    switch (userTier) {
      case "enterprise":
        return "default" as const
      case "pro":
        return "secondary" as const
      default:
        return "outline" as const
    }
  }

  const getTierBadgeClassName = () => {
    switch (userTier) {
      case "enterprise":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300 dark:from-yellow-900/20 dark:to-amber-900/20 dark:text-yellow-300 dark:border-yellow-700"
      case "pro":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300 dark:border-blue-700"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700"
    }
  }

  return (
    <>
      {isMobileBreakpoint ? (
        <Drawer open={settingsOpen} onOpenChange={handleCloseSettings}>
          <DrawerContent>
            <SettingsContent isDrawer defaultTab={settingsTab} onClose={handleCloseSettings} />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={settingsOpen} onOpenChange={handleCloseSettings}>
          <DialogContent className="flex h-[80%] min-h-[480px] w-full flex-col gap-0 p-0 sm:max-w-[768px]">
            <DialogHeader className="border-border border-b px-6 py-5">
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <SettingsContent defaultTab={settingsTab} onClose={handleCloseSettings} />
          </DialogContent>
        </Dialog>
      )}
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.profile_image || undefined} alt={user.display_name || ""} />
                <AvatarFallback className="rounded-lg">
                  {user.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.display_name || "User"}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.profile_image || undefined} alt={user.display_name || ""} />
                    <AvatarFallback className="rounded-lg">
                      {user.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.display_name || "User"}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
                <div className="pl-10">
                  <Badge variant={getTierBadgeVariant()} className={`w-fit text-xs h-5 ${getTierBadgeClassName()}`}>
                    {getTierIcon()}
                    <span className="ml-1">{USER_TIERS[userTier].name}</span>
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleUpgradeToPro}>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <SettingsTrigger />
              <FeedbackTrigger />
              <AppInfoTrigger />
              <DropdownMenuItem asChild>
                <Link href="/docs">
                  <BookOpen />
                  Documentation
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
} 