"use client"

import { useParams } from "next/navigation"
import { useMemo } from "react"
import { useChats } from "@/lib/chat-store/chats/provider"
import { groupChatsByDate } from "../../history/utils"
import { SidebarList } from "./sidebar-list"
import { MessageCircle, ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppChatHistory() {
  const { chats, isLoading } = useChats()
  const params = useParams<{ chatId: string }>()
  const currentChatId = params.chatId

  const groupedChats = useMemo(() => {
    const result = groupChatsByDate(chats, "")
    return result
  }, [chats])
  
  const hasChats = chats.length > 0

  if (isLoading) {
    return null
  }

  if (!hasChats) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>History</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex h-[calc(100vh-300px)] flex-col items-center justify-center">
            <MessageCircle
              className="h-6 w-6 text-muted-foreground mb-1 opacity-40"
            />
            <div className="text-muted-foreground text-center">
              <p className="mb-1 text-base font-medium">No chats yet</p>
              <p className="text-sm opacity-70">Start a new conversation</p>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>History</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {groupedChats?.map((group, index) => (
            <Collapsible
              key={group.name}
              defaultOpen={index === 0} // First group (most recent) open by default
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                    <span>{group.name}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-0">
                    <SidebarList
                      title=""
                      items={group.chats}
                      currentChatId={currentChatId}
                    />
                  </div>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
} 