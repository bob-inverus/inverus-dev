"use client"

import { toast } from "@/components/ui/toast"
import { createContext, useContext, useEffect, useState } from "react"
import { MODEL_DEFAULT, SYSTEM_PROMPT_DEFAULT } from "../../config"
import type { Chats } from "../types"
import {
  createNewChat as createNewChatFromDb,
  deleteChat as deleteChatFromDb,
  fetchAndCacheChats,
  getCachedChats,
  updateChatModel as updateChatModelFromDb,
  updateChatTitle,
} from "./api"

interface ChatsContextType {
  chats: Chats[]
  refresh: () => Promise<void>
  isLoading: boolean
  updateTitle: (id: string, title: string) => Promise<void>
  deleteChat: (
    id: string,
    currentChatId?: string,
    redirect?: () => void
  ) => Promise<void>
  setChats: React.Dispatch<React.SetStateAction<Chats[]>>
  createNewChat: (
    userId: string,
    title?: string,
    model?: string,
    isAuthenticated?: boolean,
    systemPrompt?: string,
    projectId?: string
  ) => Promise<Chats | undefined>
  resetChats: () => Promise<void>
  getChatById: (id: string) => Chats | undefined
  updateChatModel: (id: string, model: string) => Promise<void>
  bumpChat: (id: string) => Promise<void>
}
const ChatsContext = createContext<ChatsContextType | null>(null)

export function useChats() {
  const context = useContext(ChatsContext)
  if (!context) throw new Error("useChats must be used within ChatsProvider")
  return context
}

export function ChatsProvider({
  userId,
  children,
}: {
  userId?: string
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useState<Chats[]>([])

  useEffect(() => {
    console.log("=== CHATS PROVIDER USEEFFECT ===")
    console.log("userId:", userId)
    console.log("===============================")
    
    if (!userId) return

    const load = async () => {
      setIsLoading(true)
      const cached = await getCachedChats()
      setChats(cached)

      try {
        console.log("=== FETCHING FRESH CHATS ===")
        const fresh = await fetchAndCacheChats(userId)
        console.log("Fresh chats fetched successfully:", fresh.length)
        setChats(fresh)
      } catch (error) {
        console.log("=== FETCH CHATS ERROR ===")
        console.log("Error:", error)
        console.log("========================")
        // Don't show error toast for this - it's not critical and happens on page load
        // Just keep the cached chats that we already set
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [userId])

  const refresh = async () => {
    if (!userId) return

    const fresh = await fetchAndCacheChats(userId)
    setChats(fresh)
  }

  const updateTitle = async (id: string, title: string) => {
    const prev = [...chats]
    const updatedChatWithNewTitle = prev.map((c) =>
      c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c
    )
    const sorted = updatedChatWithNewTitle.sort(
      (a, b) => +new Date(b.updated_at || "") - +new Date(a.updated_at || "")
    )
    setChats(sorted)
    try {
      await updateChatTitle(id, title)
    } catch {
      setChats(prev)
      toast({ title: "Failed to update title", status: "error" })
    }
  }

  const deleteChat = async (
    id: string,
    currentChatId?: string,
    redirect?: () => void
  ) => {
    const prev = [...chats]
    setChats((prev) => prev.filter((c) => c.id !== id))

    try {
      await deleteChatFromDb(id)
      if (id === currentChatId && redirect) redirect()
    } catch {
      setChats(prev)
      toast({ title: "Failed to delete chat", status: "error" })
    }
  }

  const createNewChat = async (
    userId: string,
    title?: string,
    model?: string,
    isAuthenticated?: boolean,
    systemPrompt?: string,
    projectId?: string
  ) => {
    console.log("=== CREATE NEW CHAT CALLED ===")
    console.log("userId:", userId)
    console.log("title:", title)
    console.log("model:", model)
    console.log("isAuthenticated:", isAuthenticated)
    console.log("systemPrompt:", systemPrompt)
    console.log("projectId:", projectId)
    console.log("Stack trace:", new Error().stack)
    console.log("============================")
    
    if (!userId) return
    const prev = [...chats]

    const optimisticId = `optimistic-${Date.now().toString()}`
    const optimisticChat = {
      id: optimisticId,
      title: title || "New Chat",
      created_at: new Date().toISOString(),
      model: model || MODEL_DEFAULT,
      system_prompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
      user_id: userId,
      public: true,
      updated_at: new Date().toISOString(),
      project_id: null,
    }
    setChats((prev) => [optimisticChat, ...prev])

    try {
      const newChat = await createNewChatFromDb(
        userId,
        title,
        model,
        isAuthenticated,
        projectId
      )

      setChats((prev) => [
        newChat,
        ...prev.filter((c) => c.id !== optimisticId),
      ])

      return newChat
    } catch (error) {
      console.log("=== CREATE NEW CHAT ERROR ===")
      console.log("Error:", error)
      console.log("============================")
      setChats(prev)
      toast({ title: "Failed to create chat", status: "error" })
    }
  }

  const resetChats = async () => {
    setChats([])
  }

  const getChatById = (id: string) => {
    const chat = chats.find((c) => c.id === id)
    return chat
  }

  const updateChatModel = async (id: string, model: string) => {
    const prev = [...chats]
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, model } : c)))
    try {
      await updateChatModelFromDb(id, model)
    } catch {
      setChats(prev)
      toast({ title: "Failed to update model", status: "error" })
    }
  }

  const bumpChat = async (id: string) => {
    const prev = [...chats]
    const updatedChatWithNewUpdatedAt = prev.map((c) =>
      c.id === id ? { ...c, updated_at: new Date().toISOString() } : c
    )
    const sorted = updatedChatWithNewUpdatedAt.sort(
      (a, b) => +new Date(b.updated_at || "") - +new Date(a.updated_at || "")
    )
    setChats(sorted)
  }

  return (
    <ChatsContext.Provider
      value={{
        chats,
        refresh,
        updateTitle,
        deleteChat,
        setChats,
        createNewChat,
        resetChats,
        getChatById,
        updateChatModel,
        bumpChat,
        isLoading,
      }}
    >
      {children}
    </ChatsContext.Provider>
  )
}
