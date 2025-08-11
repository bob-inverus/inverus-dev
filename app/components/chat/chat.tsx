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
import { redirect } from "next/navigation"
import { useMemo, useState } from "react"
import { useChatCore } from "./use-chat-core"
import { useChatOperations } from "./use-chat-operations"
import { useFileUpload } from "./use-file-upload"
import { LandingHero } from "@/app/components/landing-hero"

const FeedbackWidget = dynamic(
  () => import("./feedback-widget").then((mod) => mod.FeedbackWidget),
  { ssr: false }
)

const DialogAuth = dynamic(
  () => import("./dialog-auth").then((mod) => mod.DialogAuth),
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
  const isAuthenticated = useMemo(() => !!user?.id, [user?.id])
  const systemPrompt = useMemo(
    () => user?.system_prompt || SYSTEM_PROMPT_DEFAULT,
    [user?.system_prompt]
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
    // Removed enableSearch and setEnableSearch since they're no longer needed
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
    }),
    [messages, status, handleDelete, handleEdit, handleReload]
  )

  // Determine if we should show onboarding - use stable calculation to prevent glitches
  const showOnboarding = useMemo(() => {
    if (isChatsLoading) return true
    return messages.length === 0 && !isSubmitting
  }, [messages.length, isChatsLoading, isSubmitting])

  // If we're loading and it's unclear what state we should be in, show onboarding layout
  const shouldShowCenteredLayout = useMemo(() => {
    return showOnboarding || isChatsLoading
  }, [showOnboarding, isChatsLoading])

  // Memoize the chat input props
  const chatInputProps = useMemo(
    () => ({
      value: input,
      onValueChange: handleInputChange,
      onSend: submit,
      isSubmitting,
      files,
      onFileUpload: handleFileUpload,
      onFileRemove: handleFileRemove,
      onSelectModel: handleModelChange,
      selectedModel,
      isUserAuthenticated: isAuthenticated,
      stop,
      status,
      // Removed enableSearch and setEnableSearch since they're no longer needed
      useAnimatedPlaceholder: shouldShowCenteredLayout,
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
      submit,
      isSubmitting,
      files,
      handleFileUpload,
      handleFileRemove,
      handleModelChange,
      selectedModel,
      isAuthenticated,
      stop,
      status,
      shouldShowCenteredLayout,
    ]
  )

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

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center justify-end md:justify-center"
      )}
    >
      <DialogAuth open={hasDialogAuth} setOpen={setHasDialogAuth} />

      {/* Main content area - full height minus fixed bottom elements */}
      <div className="flex-1 w-full flex flex-col min-h-0 relative">
        {shouldShowCenteredLayout ? (
          // Show landing hero for unauthenticated users, regular onboarding for authenticated users
          !isAuthenticated ? (
            <LandingHero />
          ) : (
            // Centered layout for onboarding (no messages)
            <div className="flex flex-col items-center justify-center flex-1 w-full min-h-0">
              <AnimatePresence initial={false} mode="popLayout">
                {!isChatsLoading && showOnboarding && (
                  <motion.div
                    key="onboarding"
                    className="mx-auto w-full max-w-[50rem] mb-8 px-4"
                    initial={{ opacity: isChatsLoading ? 1 : 0 }}
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
                    <div className="text-center w-full flex flex-col items-center">
                      <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-tight text-center mb-2">
                        Know Who's Real.
                      </h1>
                      <h2 className="text-gray-600 dark:text-gray-400 text-base md:text-lg text-center">
                        The Trust Layer for the Internet.
                      </h2>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Centered input for onboarding */}
              <motion.div
                className={cn(
                  "mx-auto w-full max-w-2xl flex-shrink-0 px-4"
                )}
                layout="position"
                layoutId="chat-input-container"
                transition={{
                  layout: {
                    duration: !isChatsLoading && messages.length >= 1 && !isSubmitting ? 0.3 : 0,
                  },
                }}
              >
                <ChatInput {...chatInputProps} />
              </motion.div>
            </div>
          )
        ) : (
          // Layout with messages/search results - single scrollable conversation area centered
          <div className="relative flex h-full w-full flex-col items-center overflow-x-hidden overflow-y-auto">
            {/* Header overlay spacer for mobile */}
            <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 mx-auto flex w-full flex-col justify-center">
              <div className="h-app-header bg-background flex w-full lg:hidden lg:h-0" />
              <div className="h-app-header bg-background flex w-full mask-b-from-4% mask-b-to-100% lg:hidden" />
            </div>
            <div className="flex relative w-full" role="log">
              <div className="w-full" style={{ height: "100%", width: "100%", overflow: "auto" }}>
                <div className="flex w-full flex-col items-center pt-20 pb-28" style={{ scrollbarGutter: "stable both-edges" }}>
                  <AnimatePresence initial={false} mode="popLayout">
                    <Conversation key="conversation" {...conversationProps} />
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed input area at bottom - only shown when not in onboarding */}
      {!shouldShowCenteredLayout && (
        <div className="transition-all duration-500 bg-[linear-gradient(to_top,theme(colors.background)_96px,transparent_0)] absolute inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl flex-shrink-0 p-0 flex justify-center pointer-events-none">
          <motion.div
            className={cn("w-full max-w-3xl flex-shrink-0 px-0 pointer-events-auto")}
            layout="position"
            layoutId="chat-input-container"
            transition={{
              layout: {
                duration: !isChatsLoading && messages.length >= 1 && !isSubmitting ? 0.3 : 0,
              },
            }}
          >
            <ChatInput {...chatInputProps} />
          </motion.div>
        </div>
      )}

      <FeedbackWidget authUserId={user?.id} />
    </div>
  )
}
