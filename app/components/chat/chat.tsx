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
      // Removed enableSearch and setEnableSearch since they're no longer needed
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

  // Determine if we should show onboarding - use stable calculation to prevent glitches
  const showOnboarding = useMemo(() => {
    // If we're still loading chats, assume onboarding until we know for sure
    if (isChatsLoading) {
      return true
    }
    
    // If there's no chatId and no messages, show onboarding
    // BUT also keep onboarding layout stable during submission to prevent layout jumps
    return !chatId && (messages.length === 0 || isSubmitting)
  }, [chatId, messages.length, isChatsLoading, isSubmitting])

  // If we're loading and it's unclear what state we should be in, show onboarding layout
  const shouldShowCenteredLayout = useMemo(() => {
    return showOnboarding || isChatsLoading
  }, [showOnboarding, isChatsLoading])

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center"
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
                      <h1 className="mb-4 text-3xl font-medium tracking-tight text-center">
                        Verify an Identity
                      </h1>
                      <h2 className="text-xl font-normal text-gray-600 text-center">
                        Type or Tap to Build a Check
                      </h2>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Centered input for onboarding */}
              <motion.div
                className={cn(
                  "mx-auto w-full max-w-3xl flex-shrink-0 px-4"
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
          // Layout with messages/search results - scrollable conversation area
          <div className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden">
            <div className="w-full h-full overflow-y-auto pb-40">
              <AnimatePresence initial={false} mode="popLayout">
                <Conversation key="conversation" {...conversationProps} />
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Fixed input area at bottom - only shown when not in onboarding */}
      {!shouldShowCenteredLayout && (
        <div className="fixed bottom-8 left-0 right-0 z-10 w-full flex-shrink-0 bg-background/95 backdrop-blur-sm border-t border-border/10 md:left-[var(--sidebar-width)] md:peer-data-[state=collapsed]:left-[var(--sidebar-width-icon)]">
          <motion.div
            className={cn(
              "mx-auto w-full max-w-3xl flex-shrink-0 px-4"
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
      )}

      {/* Fixed disclaimer at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-10 w-full flex-shrink-0 bg-background/95 backdrop-blur-sm md:left-[var(--sidebar-width)] md:peer-data-[state=collapsed]:left-[var(--sidebar-width-icon)]">
        <div className="mx-auto w-full max-w-3xl flex-shrink-0 flex justify-center">
          <div className="text-muted-foreground text-center text-xs sm:text-sm p-2 w-full">
            AI can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>

      <FeedbackWidget authUserId={user?.id} />
    </div>
  )
}
