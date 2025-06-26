"use client"

import * as React from "react"
import Link from "next/link"
import { InverusIcon } from "@/components/icons/inverus"
import { APP_NAME } from "@/lib/config"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebarHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-pointer"
          asChild
        >
          <Link href="/">
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <InverusIcon className="size-6" />
            </div>
            <div className="grid flex-1 text-left text-xl leading-tight">
              <span className="truncate font-medium">{APP_NAME}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
} 