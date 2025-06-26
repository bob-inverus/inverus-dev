"use client"

import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { useState } from "react"
import { SettingsContent } from "../settings-content"

export function AccountTrigger() {
  const [open, setOpen] = useState(false)
  const isMobile = useBreakpoint(768)

  const trigger = (
    <div 
      role="menuitem" 
      data-slot="dropdown-menu-item" 
      data-variant="default" 
      className="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4" 
      tabIndex={-1} 
      data-orientation="vertical" 
      data-radix-collection-item=""
      onClick={(e) => e.preventDefault()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-check">
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
      Account
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <SettingsContent isDrawer onClose={() => setOpen(false)} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex h-[80%] min-h-[480px] w-full flex-col gap-0 p-0 sm:max-w-[768px]">
        <DialogHeader className="border-border border-b px-6 py-5">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <SettingsContent onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
} 