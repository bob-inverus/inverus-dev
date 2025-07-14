"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useState } from "react"

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

export function NavMain({
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
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})

  const toggleProjectExpansion = (itemTitle: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [itemTitle]: !prev[itemTitle]
    }))
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isProjectsSection = item.title.toLowerCase().includes('project')
          const hasMoreThanThree = item.items && item.items.length > 3
          const isExpanded = expandedProjects[item.title]
          
          // For projects section, show latest 3 (last 3 items) when collapsed
          let displayItems = item.items
          if (isProjectsSection && hasMoreThanThree && !isExpanded) {
            displayItems = item.items?.slice(-3) // Get the last 3 items (latest)
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
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
                    {displayItems?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    {isProjectsSection && hasMoreThanThree && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          onClick={() => toggleProjectExpansion(item.title)}
                          className="cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          <span>
                            {isExpanded 
                              ? '...show less' 
                              : `...${item.items!.length - 3} more (older)`
                            }
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
