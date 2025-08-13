"use client"

import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import XIcon from "@/components/icons/x"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useChatSession } from "@/lib/chat-store/session/provider"
import { APP_DOMAIN } from "@/lib/config"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { Check, Copy, Globe, LoaderCircle } from "lucide-react"
import type React from "react"
import { useState, useEffect } from "react"

type DialogPublishProps = {
  trigger?: React.ReactNode
}

export function DialogPublish({ trigger }: DialogPublishProps = {}) {
  const [openDialog, setOpenDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { chatId } = useChatSession()
  const isMobile = useBreakpoint(768)
  const [copied, setCopied] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  // Check if chat is already published on mount
  useEffect(() => {
    checkIfPublished()
  }, [chatId])

  if (!isSupabaseEnabled) {
    return null
  }

  if (!chatId) {
    return null
  }

  const publicLink = `${APP_DOMAIN}/share/${chatId}`

  const openPage = () => {
    setOpenDialog(false)

    window.open(publicLink, "_blank")
  }

  const shareOnX = () => {
    setOpenDialog(false)

    const X_TEXT = `Check out this public page I created with inVerus! ${publicLink}`
    window.open(`https://x.com/intent/tweet?text=${X_TEXT}`, "_blank")
  }

  const handlePublish = async () => {
    console.log("Publishing chat:", chatId)
    console.log("Already published:", isPublished)
    
    setIsLoading(true)

    const supabase = createClient()

    if (!supabase) {
      throw new Error("Supabase is not configured")
    }

    const { data, error } = await supabase
      .from("chats")
      .update({ public: true })
      .eq("id", chatId)
      .select()
      .single()

    console.log("Publish result:", { data, error })

    if (error) {
      console.error(error)
    }

    if (data) {
      setIsPublished(true)
    }
    
    setIsLoading(false)
  }

  // Check if chat is already published
  const checkIfPublished = async () => {
    const supabase = createClient()
    if (!supabase) return
    
    const { data } = await supabase
      .from("chats")
      .select("public")
      .eq("id", chatId)
      .single()
    
    if (data?.public) {
      setIsPublished(true)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink)

    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const triggerElement = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-muted bg-background rounded-full p-1.5 transition-colors"
            onClick={() => setOpenDialog(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Globe className="size-5" />
            )}
            <span className="sr-only">Make public</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Make public</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  // Handle when dialog opens - auto-publish if not published yet
  const handleOpenChange = (open: boolean) => {
    setOpenDialog(open)
    if (open && !isLoading && !isPublished) {
      handlePublish()
    }
  }

  // Use custom trigger if provided, otherwise use default
  const finalTrigger = trigger 
    ? (
        <div onClick={() => setOpenDialog(true)} style={{ display: 'inline-block' }}>
          {trigger}
        </div>
      )
    : triggerElement

  const content = (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <Input id="slug" value={publicLink} readOnly className="flex-1" />
              <Button
                variant="outline"
                onClick={copyLink}
                className="bg-background hover:bg-background absolute top-0 right-0 rounded-l-none transition-colors"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={openPage} className="flex-1">
          View Page
        </Button>
        <Button onClick={shareOnX} className="flex-1">
          Share on <XIcon className="text-primary-foreground size-4" />
        </Button>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        {finalTrigger}
        <Drawer open={openDialog} onOpenChange={handleOpenChange}>
          <DrawerContent className="bg-background border-border">
            <DrawerHeader>
              <DrawerTitle>Your conversation is now public!</DrawerTitle>
              <DrawerDescription>
                Anyone with the link can now view this conversation and may
                appear in community feeds, featured pages, or search results in
                the future.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-4 px-4 pb-6">{content}</div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <>
      {finalTrigger}
      <Dialog open={openDialog} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Your conversation is now public!</DialogTitle>
            <DialogDescription>
              Anyone with the link can now view this conversation and may appear
              in community feeds, featured pages, or search results in the
              future.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    </>
  )
}