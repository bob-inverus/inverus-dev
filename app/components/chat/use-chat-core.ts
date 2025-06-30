import { useChatDraft } from "@/app/hooks/use-chat-draft"
import { toast } from "@/components/ui/toast"
import { getOrCreateGuestUserId } from "@/lib/api"
import { MESSAGE_MAX_LENGTH, SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { Attachment } from "@/lib/file-handling"
import { API_ROUTE_CHAT } from "@/lib/routes"
import { useChat } from "@ai-sdk/react"
import type { Message } from "@ai-sdk/react"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type UseChatCoreProps = {
  initialMessages: Message[]
  draftValue: string
  cacheAndAddMessage: (message: Message) => void
  chatId: string | null
  user: any
  files: File[]
  createOptimisticAttachments: (files: File[]) => any[]
  setFiles: (files: File[]) => void
  checkLimitsAndNotify: (uid: string) => Promise<boolean>
  cleanupOptimisticAttachments: (attachments?: any[]) => void
  ensureChatExists: (uid: string) => Promise<string | null>
  handleFileUploads: (
    uid: string,
    chatId: string
  ) => Promise<Attachment[] | null>
  selectedModel: string
  clearDraft: () => void
  bumpChat: (chatId: string) => void
}

export function useChatCore({
  initialMessages,
  draftValue,
  cacheAndAddMessage,
  chatId,
  user,
  files,
  createOptimisticAttachments,
  setFiles,
  checkLimitsAndNotify,
  cleanupOptimisticAttachments,
  ensureChatExists,
  handleFileUploads,
  selectedModel,
  clearDraft,
  bumpChat,
}: UseChatCoreProps) {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasDialogAuth, setHasDialogAuth] = useState(false)
  const [enableSearch, setEnableSearch] = useState(false)

  // Refs and derived state
  const hasSentFirstMessageRef = useRef(false)
  const prevChatIdRef = useRef<string | null>(chatId)
  const isAuthenticated = useMemo(() => !!user?.id, [user?.id])
  const systemPrompt = useMemo(
    () => user?.system_prompt || SYSTEM_PROMPT_DEFAULT,
    [user?.system_prompt]
  )

  // Search params handling
  const searchParams = useSearchParams()
  const prompt = searchParams.get("prompt")

  // Handle errors directly in onError callback
  const handleError = useCallback((error: Error) => {
    console.error("Chat error:", error)
    console.error("Error message:", error.message)
    let errorMsg = error.message || "Something went wrong."

    if (errorMsg === "An error occurred" || errorMsg === "fetch failed") {
      errorMsg = "Something went wrong. Please try again."
    }

    toast({
      title: errorMsg,
      status: "error",
    })
  }, [])

  // Initialize useChat
  const {
    messages,
    input,
    handleSubmit,
    status,
    error,
    reload,
    stop,
    setMessages,
    setInput,
    append,
  } = useChat({
    api: API_ROUTE_CHAT,
    initialMessages,
    initialInput: draftValue,
    onFinish: cacheAndAddMessage,
    onError: handleError,
  })

  // Handle search params on mount
  useEffect(() => {
    if (prompt && typeof window !== "undefined") {
      requestAnimationFrame(() => setInput(prompt))
    }
  }, [prompt, setInput])

  // Reset messages when navigating from a chat to home
  if (
    prevChatIdRef.current !== null &&
    chatId === null &&
    messages.length > 0
  ) {
    setMessages([])
  }
  prevChatIdRef.current = chatId

  // Submit action
  const submit = useCallback(async () => {
    setIsSubmitting(true)

    // Check if this is a people search FIRST (contains both "first name:" and "last name:")
    const isPeopleSearch = input.toLowerCase().includes("first name:") && 
                          input.toLowerCase().includes("last name:")

    console.log("=== PEOPLE SEARCH DEBUG ===")
    console.log("Input:", input)
    console.log("isPeopleSearch:", isPeopleSearch)
    console.log("========================")

    // Handle people search locally without ANY API calls
    if (isPeopleSearch) {
      try {
        const optimisticId = `optimistic-${Date.now().toString()}`
        
        const optimisticMessage = {
          id: optimisticId,
          content: input,
          role: "user" as const,
          createdAt: new Date(),
        }

        setMessages((prev) => [...prev, optimisticMessage])
        setInput("")
        setFiles([])

        // Create static assistant response immediately without API calls
        const assistantResponseId = `response-${Date.now().toString()}`
        const assistantMessage = {
          id: assistantResponseId,
          content: "I found 1 verified individual in our database matching your search criteria. The result includes a Trust Score (based on verification data) and Confidence Score (based on data quality indicators). The charts below show the reliability and accuracy assessment for the person found.",
          role: "assistant" as const,
          createdAt: new Date(),
        }

        // Add assistant response to local state
        setMessages((prev) => [...prev, assistantMessage])
        
        // Clear the form
        clearDraft()
        setIsSubmitting(false)
        return
      } catch (error) {
        toast({ title: "Failed to process search", status: "error" })
        setIsSubmitting(false)
        return
      }
    }

    // For non-people searches, continue with normal API flow
    const uid = await getOrCreateGuestUserId(user)
    if (!uid) {
      setIsSubmitting(false)
      return
    }

    const optimisticId = `optimistic-${Date.now().toString()}`
    const optimisticAttachments =
      files.length > 0 ? createOptimisticAttachments(files) : []

    const optimisticMessage = {
      id: optimisticId,
      content: input,
      role: "user" as const,
      createdAt: new Date(),
      experimental_attachments:
        optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setInput("")

    const submittedFiles = [...files]
    setFiles([])

    try {
      const allowed = await checkLimitsAndNotify(uid)
      if (!allowed) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        return
      }

      const currentChatId = await ensureChatExists(uid)
      if (!currentChatId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        return
      }

      if (input.length > MESSAGE_MAX_LENGTH) {
        toast({
          title: `The message you submitted was too long, please submit something shorter. (Max ${MESSAGE_MAX_LENGTH} characters)`,
          status: "error",
        })
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
        return
      }

      let attachments: Attachment[] | null = []
      if (submittedFiles.length > 0) {
        attachments = await handleFileUploads(uid, currentChatId)
        if (attachments === null) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
          cleanupOptimisticAttachments(
            optimisticMessage.experimental_attachments
          )
          return
        }
      }

      const options = {
        body: {
          chatId: currentChatId,
          userId: uid,
          model: selectedModel,
          isAuthenticated,
          systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
          enableSearch,
        },
        experimental_attachments: attachments || undefined,
      }

      handleSubmit(undefined, options)
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      cacheAndAddMessage(optimisticMessage)
      clearDraft()

      if (messages.length > 0) {
        bumpChat(currentChatId)
      }
    } catch (submitError) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      cleanupOptimisticAttachments(optimisticMessage.experimental_attachments)
      toast({ title: "Failed to send message", status: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }, [
    user,
    files,
    createOptimisticAttachments,
    input,
    setMessages,
    setInput,
    setFiles,
    checkLimitsAndNotify,
    cleanupOptimisticAttachments,
    ensureChatExists,
    handleFileUploads,
    selectedModel,
    isAuthenticated,
    systemPrompt,
    enableSearch,
    handleSubmit,
    cacheAndAddMessage,
    clearDraft,
    messages.length,
    bumpChat,
    setIsSubmitting,
  ])

  // Handle suggestion
  const handleSuggestion = useCallback(
    async (suggestion: string) => {
      setIsSubmitting(true)
      const optimisticId = `optimistic-${Date.now().toString()}`
      const optimisticMessage = {
        id: optimisticId,
        content: suggestion,
        role: "user" as const,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      try {
        const uid = await getOrCreateGuestUserId(user)

        if (!uid) {
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
          return
        }

        const allowed = await checkLimitsAndNotify(uid)
        if (!allowed) {
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
          return
        }

        const currentChatId = await ensureChatExists(uid)

        if (!currentChatId) {
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
          return
        }

        const options = {
          body: {
            chatId: currentChatId,
            userId: uid,
            model: selectedModel,
            isAuthenticated,
            systemPrompt: SYSTEM_PROMPT_DEFAULT,
          },
        }

        append(
          {
            role: "user",
            content: suggestion,
          },
          options
        )
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      } catch (suggestionError) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        toast({ title: "Failed to send suggestion", status: "error" })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      ensureChatExists,
      selectedModel,
      user,
      append,
      checkLimitsAndNotify,
      isAuthenticated,
      setMessages,
      setIsSubmitting,
    ]
  )

  // Handle reload
  const handleReload = useCallback(async () => {
    const uid = await getOrCreateGuestUserId(user)
    if (!uid) {
      return
    }

    const options = {
      body: {
        chatId,
        userId: uid,
        model: selectedModel,
        isAuthenticated,
        systemPrompt: systemPrompt || SYSTEM_PROMPT_DEFAULT,
      },
    }

    reload(options)
  }, [user, chatId, selectedModel, isAuthenticated, systemPrompt, reload])

  // Handle input change - now with access to the real setInput function!
  const { setDraftValue } = useChatDraft(chatId)
  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value)
      setDraftValue(value)
    },
    [setInput, setDraftValue]
  )

  return {
    // Chat state
    messages,
    input,
    handleSubmit,
    status,
    error,
    reload,
    stop,
    setMessages,
    setInput,
    append,
    isAuthenticated,
    systemPrompt,
    hasSentFirstMessageRef,

    // Component state
    isSubmitting,
    setIsSubmitting,
    hasDialogAuth,
    setHasDialogAuth,
    enableSearch,
    setEnableSearch,

    // Actions
    submit,
    handleSuggestion,
    handleReload,
    handleInputChange,
  }
}
