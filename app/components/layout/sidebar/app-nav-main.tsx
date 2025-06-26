"use client"

import { ChevronRight, Edit, Search, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { HistoryTrigger } from "../../history/history-trigger"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useChats } from "@/lib/chat-store/chats/provider"
import { useUser } from "@/lib/user-store/provider"
import { useKeyShortcut } from "@/app/hooks/use-key-shortcut"
import { useState, useRef, useEffect } from "react"

export function AppNavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const router = useRouter()
  const { createNewChat } = useChats()
  const { user } = useUser()
  const hiddenSearchRef = useRef<HTMLDivElement>(null)

  const handleNewChat = async () => {
    if (!user?.id) {
      router.push("/")
      return
    }
    
    try {
      const newChat = await createNewChat(user.id)
      if (newChat) {
        router.push(`/c/${newChat.id}`)
      }
    } catch (error) {
      console.error("Failed to create new chat:", error)
      router.push("/")
    }
  }

  const handleSearchClick = () => {
    // Find and click the hidden search trigger
    const searchButton = hiddenSearchRef.current?.querySelector('button')
    if (searchButton) {
      searchButton.click()
    }
  }

  // Add keyboard shortcut for new chat (⌘⇧U)
  useKeyShortcut(
    (e) => (e.key === "u" || e.key === "U") && e.metaKey && e.shiftKey,
    handleNewChat
  )

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
        {/* New Chat - Standalone with Edit icon */}
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleNewChat} tooltip="New Chat">
            <Edit />
            <span>New Chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Search - Standalone with Search icon, styled like New Chat */}
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleSearchClick} tooltip="Search">
            <Search />
            <span>Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Collapsible Sections */}
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={false}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
              </SidebarMenu>
      </SidebarGroup>

      {/* Hidden search trigger */}
      <div ref={hiddenSearchRef} style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <HistoryTrigger
          hasPopover={true}
        />
      </div>
    </>
  )
} 