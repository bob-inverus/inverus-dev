"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from "@/lib/user-store/provider"
import { 
  BookOpen, 
  LogOut,
  BadgeCheck,
  Sun
} from "lucide-react"
import Link from "next/link"
import { AppInfoTrigger } from "./app-info/app-info-trigger"
import { FeedbackTrigger } from "./feedback/feedback-trigger"
import { SettingsTrigger } from "./settings/settings-trigger"
import { ThemeSwitcher } from "./theme-switcher"
import { UpgradeTrigger } from "./upgrade/upgrade-trigger"

export function UserMenu() {
  const { user, signOut } = useUser()

  if (!user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  const userTier = user?.tier || "basic"
  const tierLabel = userTier.charAt(0).toUpperCase() + userTier.slice(1)

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage 
                src={user?.profile_image || undefined} 
                alt={user?.display_name || "User avatar"}
                className="aspect-square size-full object-cover" 
              />
              <AvatarFallback className="bg-muted">
                {user?.display_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Profile</TooltipContent>
      </Tooltip>
      
      <DropdownMenuContent
        align="end"
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        forceMount
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex flex-col gap-2 px-1 py-1.5 text-left text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage 
                  src={user?.profile_image || undefined} 
                  alt={user?.display_name || "User avatar"}
                  className="aspect-square size-full object-cover" 
                />
                <AvatarFallback className="bg-muted">
                  {user?.display_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.display_name}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <div className="pl-10">
              <Badge 
                variant="outline" 
                className="w-fit text-xs h-5 bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700"
              >
                <BadgeCheck className="size-3 text-gray-500" />
                <span className="ml-1">{tierLabel}</span>
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <UpgradeTrigger />
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <SettingsTrigger />
          <div 
            role="menuitem" 
            data-slot="dropdown-menu-item" 
            data-variant="default" 
            className="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex items-center gap-2 rounded-sm px-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer py-1 hover:bg-transparent!" 
            tabIndex={-1} 
            data-orientation="vertical" 
            data-radix-collection-item=""
          >
            <div className="flex items-center justify-between w-full px-0">
              <div className="flex items-center gap-2">
                <Sun className="size-4" />
                <span className="text-sm">Theme</span>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
          <FeedbackTrigger />
          <AppInfoTrigger />
          <DropdownMenuItem asChild>
            <Link href="/docs">
              <BookOpen className="size-4" />
              <span>Documentation</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
