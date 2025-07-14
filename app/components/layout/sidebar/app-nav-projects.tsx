"use client"

import {
  FolderPlus,
  Folder,
  Forward,
  MoreHorizontal,
  Trash,
  Edit,
  Check,
  X,
} from "lucide-react"
import Link from "next/link"
import { useState, useMemo, useRef, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/lib/user-store/provider"
import { DialogCreateProject } from "./dialog-create-project"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type Project = {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function AppNavProjects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const { user } = useUser()
  const { isMobile } = useSidebar()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      return response.json()
    },
    enabled: !!user, // Only fetch projects if user is authenticated
  })

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, name }: { projectId: string; name: string }) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update project")
      }

      return response.json()
    },
    onMutate: async ({ projectId, name }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["projects"] })

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(["projects"])

      // Optimistically update projects list
      queryClient.setQueryData(["projects"], (old: any) => {
        if (!old) return old
        return old.map((p: any) => (p.id === projectId ? { ...p, name } : p))
      })

      return { previousProjects, projectId }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })

  // Sort projects by created_at date (newest first) and determine which projects to show
  const { sortedProjects, displayedProjects, hasMore } = useMemo(() => {
    const sorted = [...projects].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    const displayed = showAllProjects ? sorted : sorted.slice(0, 3)
    const hasMoreProjects = sorted.length > 3
    
    return {
      sortedProjects: sorted,
      displayedProjects: displayed,
      hasMore: hasMoreProjects
    }
  }, [projects, showAllProjects])

  const handleStartEditing = useCallback((project: Project) => {
    setEditingProjectId(project.id)
    setEditName(project.name || "")
    
    // Focus the input after state update
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 0)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (editingProjectId && editName.trim()) {
      const currentProject = projects.find(p => p.id === editingProjectId)
      if (currentProject && editName.trim() !== currentProject.name) {
        updateProjectMutation.mutate({
          projectId: editingProjectId,
          name: editName.trim(),
        })
      }
    }
    setEditingProjectId(null)
    setEditName("")
  }, [editingProjectId, editName, projects, updateProjectMutation])

  const handleCancelEdit = useCallback(() => {
    setEditingProjectId(null)
    setEditName("")
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancelEdit()
    }
  }, [handleSaveEdit, handleCancelEdit])

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/auth">
                <FolderPlus className="h-4 w-4" />
                <span>Login to create projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          {/* Add New Project Button */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setIsDialogOpen(true)} tooltip="New Project">
              <FolderPlus className="h-4 w-4" />
              <span>New Project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Project List */}
          {!isLoading && displayedProjects.map((project) => (
            <SidebarMenuItem key={project.id}>
              {editingProjectId === project.id ? (
                // Edit mode
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Folder className="h-4 w-4 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 hover:bg-sidebar-accent rounded"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 hover:bg-sidebar-accent rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                // View mode
                <>
                  <SidebarMenuButton asChild>
                    <Link href={`/project/${project.id}`}>
                      <Folder className="h-4 w-4" />
                      <span>{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem asChild>
                        <Link href={`/project/${project.id}`}>
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span>View Project</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStartEditing(project)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Forward className="h-4 w-4 text-muted-foreground" />
                        <span>Share Project</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="h-4 w-4 text-muted-foreground" />
                        <span>Delete Project</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </SidebarMenuItem>
          ))}

          {/* More Projects Button */}
          {hasMore && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                className="text-sidebar-foreground/70 cursor-pointer hover:text-sidebar-foreground"
                onClick={() => setShowAllProjects(!showAllProjects)}
              >
                <MoreHorizontal className="h-4 w-4 text-sidebar-foreground/70" />
                <span>
                  {showAllProjects 
                    ? 'Show less' 
                    : `${sortedProjects.length - 3} more`
                  }
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      <DialogCreateProject isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </>
  )
} 