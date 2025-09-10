"use client"

import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import { useUser } from "@/lib/user-store/provider"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { SettingsContent } from "../settings/settings-content"

export function DowngradeTrigger() {
  const { user } = useUser()
  const isMobile = useBreakpoint(768)
  const [isOpen, setIsOpen] = useState(false)

  // Don't show downgrade if user is on basic tier
  if (user?.tier === "basic" || !user?.tier) {
    return null
  }

  const trigger = (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <ChevronDown className="size-4" />
      <span>Manage Plan</span>
    </DropdownMenuItem>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <SettingsContent isDrawer defaultTab="account" onClose={() => setIsOpen(false)} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex h-[80%] min-h-[480px] w-full flex-col gap-0 p-0 sm:max-w-[768px]">
        <DialogHeader className="border-border border-b px-6 py-5">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <SettingsContent defaultTab="account" onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
