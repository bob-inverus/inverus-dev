"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { fetchClient } from "@/lib/fetch"
import { useUser } from "@/lib/user-store/provider"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

type DialogCreateProjectProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

type CreateProjectData = {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function DialogCreateProject({
  isOpen,
  setIsOpen,
}: DialogCreateProjectProps) {
  const [projectName, setProjectName] = useState("")
  const queryClient = useQueryClient()
  const router = useRouter()
  const { user } = useUser()
  
  const createProjectMutation = useMutation({
    mutationFn: async (name: string): Promise<CreateProjectData> => {
      const response = await fetchClient("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 400 && errorData.error === "Missing userId") {
          throw new Error("You must be logged in to create projects. Please log in first.")
        }
        throw new Error(errorData.error || "Failed to create project")
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      router.push(`/p/${data.id}`)
      setProjectName("")
      setIsOpen(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      return // This shouldn't happen as the form should be disabled
    }
    if (projectName.trim()) {
      createProjectMutation.mutate(projectName.trim())
    }
  }

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to create projects.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Please log in to your account to create and manage projects.
            </p>
            <Link href="/auth">
              <Button className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter a name for your new project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />
            {createProjectMutation.error && (
              <p className="text-sm text-red-500 mt-2">
                {createProjectMutation.error.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!projectName.trim() || createProjectMutation.isPending}
            >
              {createProjectMutation.isPending
                ? "Creating..."
                : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
