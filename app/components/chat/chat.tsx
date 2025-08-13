"use client"

import { ChatInput } from "@/app/components/chat-input/chat-input"
import { Conversation } from "@/app/components/chat/conversation"
import { useModel } from "@/app/components/chat/use-model"
import { useChatDraft } from "@/app/hooks/use-chat-draft"
import { useChats } from "@/lib/chat-store/chats/provider"
import { useMessages } from "@/lib/chat-store/messages/provider"
import { useChatSession } from "@/lib/chat-store/session/provider"
import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { useUser } from "@/lib/user-store/provider"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import dynamic from "next/dynamic"
import { redirect, usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useGuestQueries } from "@/app/hooks/use-guest-queries"
import { useChatCore } from "./use-chat-core"
import { useChatOperations } from "./use-chat-operations"
import { useFileUpload } from "./use-file-upload"

const FeedbackWidget = dynamic(
  () => import("./feedback-widget").then((mod) => mod.FeedbackWidget),
  { ssr: false }
)

const DialogAuth = dynamic(
  () => import("./dialog-auth").then((mod) => mod.DialogAuth),
  { ssr: false }
)

const DialogAuthWelcome = dynamic(
  () => import("./dialog-auth-welcome").then((mod) => mod.DialogAuthWelcome),
  { ssr: false }
)

export function Chat() {
  const { chatId } = useChatSession()
  const {
    createNewChat,
    getChatById,
    updateChatModel,
    bumpChat,
    isLoading: isChatsLoading,
  } = useChats()

  const currentChat = useMemo(
    () => (chatId ? getChatById(chatId) : null),
    [chatId, getChatById]
  )

  const { messages: initialMessages, cacheAndAddMessage } = useMessages()
  const { user } = useUser()
  const { preferences } = useUserPreferences()
  const { draftValue, clearDraft } = useChatDraft(chatId)
  const pathname = usePathname()

  // File upload functionality
  const {
    files,
    setFiles,
    handleFileUploads,
    createOptimisticAttachments,
    cleanupOptimisticAttachments,
    handleFileUpload,
    handleFileRemove,
  } = useFileUpload()

  // Model selection
  const { selectedModel, handleModelChange } = useModel({
    currentChat: currentChat || null,
    user,
    updateChatModel,
    chatId,
  })

  // State to pass between hooks
  const [hasDialogAuth, setHasDialogAuth] = useState(false)
  const [hasAuthWelcome, setHasAuthWelcome] = useState(false)
  const [hasSeenWarning, setHasSeenWarning] = useState(false)
  const isAuthenticated = useMemo(() => !!user?.id, [user?.id])
  
  // Guest query management
  const guestQueries = useGuestQueries()
  const systemPrompt = useMemo(
    () => user?.system_prompt || SYSTEM_PROMPT_DEFAULT,
    [user?.system_prompt]
  )

  // New state for quoted text
  const [quotedText, setQuotedText] = useState<{
    text: string
    messageId: string
  }>()
  const handleQuotedSelected = useCallback(
    (text: string, messageId: string) => {
      setQuotedText({ text, messageId })
    },
    []
  )

  // Chat operations (utils + handlers) - created first
  const { checkLimitsAndNotify, ensureChatExists, handleDelete, handleEdit } =
    useChatOperations({
      isAuthenticated,
      chatId,
      messages: initialMessages,
      input: draftValue,
      selectedModel,
      systemPrompt,
      createNewChat,
      setHasDialogAuth,
      setMessages: () => {},
      setInput: () => {},
    })

  // Core chat functionality (initialization + state + actions)
  const {
    messages,
    input,
    status,
    stop,
    hasSentFirstMessageRef,
    isSubmitting,
    submit,
    handleReload,
    handleInputChange,
  } = useChatCore({
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
  })

  // Memoize the conversation props to prevent unnecessary rerenders
  const conversationProps = useMemo(
    () => ({
      messages,
      status,
      onDelete: handleDelete,
      onEdit: handleEdit,
      onReload: handleReload,
      onQuote: handleQuotedSelected,
      isAuthenticated,
      onSignIn: () => setHasAuthWelcome(true),
    }),
    [
      messages,
      status,
      handleDelete,
      handleEdit,
      handleReload,
      handleQuotedSelected,
      isAuthenticated,
    ]
  )

  // Memoize the chat input props - moved after showOnboarding definition

  // Handle redirect for invalid chatId - only redirect if we're certain the chat doesn't exist
  // and we're not in a transient state during chat creation
  if (
    chatId &&
    !isChatsLoading &&
    !currentChat &&
    !isSubmitting &&
    status === "ready" &&
    messages.length === 0 &&
    !hasSentFirstMessageRef.current // Don't redirect if we've already sent a message in this session
  ) {
    return redirect("/")
  }

  const showOnboarding = messages.length === 0

  // Custom submit handler with guest query limits
  const handleSubmitWithLimits = useCallback(async () => {
    // For unauthenticated users, always show auth dialog first if they haven't seen it
    if (!isAuthenticated) {
      // If they've reached the limit, always show auth dialog
      if (!guestQueries.canMakeQuery()) {
        setHasAuthWelcome(true)
        return
      }
      
      // If this is their first query and they haven't seen the warning, show auth dialog
      if (guestQueries.queryCount === 0 && messages.length === 0 && !hasSeenWarning) {
        setHasAuthWelcome(true)
        return
      }
      
      // Increment query count for guest users
      guestQueries.incrementQueryCount()
    }
    
    // Proceed with normal submit
    await submit()
  }, [isAuthenticated, guestQueries, submit, messages.length, hasSeenWarning])

  // Reset guest queries when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && guestQueries.queryCount > 0) {
      guestQueries.resetQueryCount()
    }
  }, [isAuthenticated, guestQueries])

  // Listen for custom auth trigger events from disabled input
  useEffect(() => {
    const handleTriggerAuth = () => {
      if (!isAuthenticated && guestQueries.hasReachedLimit) {
        setHasAuthWelcome(true)
      }
    }

    window.addEventListener('triggerAuth', handleTriggerAuth)
    return () => window.removeEventListener('triggerAuth', handleTriggerAuth)
  }, [isAuthenticated, guestQueries.hasReachedLimit])

  // Memoize the chat input props
  const chatInputProps = useMemo(
    () => ({
      value: input,
      onValueChange: handleInputChange,
      onSend: handleSubmitWithLimits,
      isSubmitting,
      files,
      onFileUpload: handleFileUpload,
      onFileRemove: handleFileRemove,
      onSelectModel: handleModelChange,
      selectedModel,
      isUserAuthenticated: isAuthenticated,
      stop,
      status,
      quotedText,
      disabled: !isAuthenticated && guestQueries.hasReachedLimit,
      useAnimatedPlaceholder: pathname === "/" || showOnboarding,
      animatedPlaceholders: [
        "Ask InVerus to verify someone...",
        "Try \"Jasmine Kaur\" or \"Elon Musk\"",
        "Curious how someone shows up online?",
        "Run a sample Trust Score.",
        "What's their digital signal say?",
        "Don't guess. Check the signal.",
        "Verify this person's identity",
        "Check their online presence",
        "What's their trust rating?",
        "Run identity verification",
        "Analyze digital footprint",
        "Verify social media profiles",
        "Check professional background",
        "Validate online credentials",
        "Assess digital reputation",
        "Verify business identity",
        "Check public records",
        "Analyze trust signals",
        "Validate online activity",
        "Check identity authenticity",
      ],
    }),
    [
      input,
      handleInputChange,
      handleSubmitWithLimits,
      isSubmitting,
      files,
      handleFileUpload,
      handleFileRemove,
      handleModelChange,
      selectedModel,
      isAuthenticated,
      stop,
      status,
      quotedText,
      pathname,
      showOnboarding,
      guestQueries.hasReachedLimit,
      messages.length,
    ]
  )

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center justify-end md:justify-center"
      )}
    >
      <DialogAuth open={hasDialogAuth} setOpen={setHasDialogAuth} />
      <DialogAuthWelcome 
        open={hasAuthWelcome} 
        setOpen={(open) => {
          setHasAuthWelcome(open)
          if (!open) {
            setHasSeenWarning(true)
          }
        }} 
      />

      <AnimatePresence initial={false} mode="popLayout">
        {showOnboarding ? (
          <motion.div
            key="onboarding"
            className="absolute bottom-[60%] mx-auto max-w-[50rem] md:relative md:bottom-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout="position"
            layoutId="onboarding"
            transition={{
              layout: {
                duration: 0,
              },
            }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-tight max-w-4xl text-gray-900 dark:text-gray-100 text-balance mb-6">
                Know Who&apos;s Real.
              </h1>
              <div className="mb-4 md:mb-8">
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl text-lg">
                  The Trust Layer for the Internet.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <Conversation key="conversation" {...conversationProps} />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl"
        )}
        layout="position"
        layoutId="chat-input-container"
        transition={{
          layout: {
            duration: messages.length === 1 ? 0.3 : 0,
          },
        }}
      >
        <ChatInput {...chatInputProps} />
      </motion.div>

      <FeedbackWidget authUserId={user?.id} />
    </div>
  )
}
