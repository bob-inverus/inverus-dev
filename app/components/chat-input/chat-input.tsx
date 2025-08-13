"use client"

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import { getModelInfo } from "@/lib/models"
import { ArrowUp, Square } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { ButtonFileUpload } from "./button-file-upload"
import { ButtonSearch } from "./button-search"
import { ButtonTools } from "./button-tools"
import { FileList } from "./file-list"
import { TextLoop } from "@/components/ui/text-loop"

type ChatInputProps = {
  value: string
  onValueChange: (value: string) => void
  onSend: () => void
  isSubmitting?: boolean
  hasMessages?: boolean
  files: File[]
  onFileUpload: (files: File[]) => void
  onFileRemove: (file: File) => void
  onSelectModel: (model: string) => void
  selectedModel: string
  isUserAuthenticated: boolean
  stop: () => void
  status?: "submitted" | "streaming" | "ready" | "error"
  disabled?: boolean
  // Removed setEnableSearch and enableSearch props since search button was removed
  useAnimatedPlaceholder?: boolean
  animatedPlaceholders?: string[]
}

export function ChatInput({
  value,
  onValueChange,
  onSend,
  isSubmitting,
  files,
  onFileUpload,
  onFileRemove,
  onSelectModel,
  selectedModel,
  isUserAuthenticated,
  stop,
  status,
  disabled = false,
  // Removed setEnableSearch and enableSearch props
  useAnimatedPlaceholder = false,
  animatedPlaceholders = [],
}: ChatInputProps) {
  const [selectedService, setSelectedService] = useState<string | undefined>("harvestor")
  const selectModelConfig = getModelInfo(selectedModel)
  const hasSearchSupport = Boolean(selectModelConfig?.webSearch)
  const isOnlyWhitespace = (text: string) => !/[\s\S]*\S[\s\S]*/.test(text) === false ? false : !/[^\s]/.test(text)

  const handleSend = useCallback(() => {
    if (disabled) {
      // Trigger auth popup when trying to send while disabled
      const triggerAuthEvent = new CustomEvent('triggerAuth')
      window.dispatchEvent(triggerAuthEvent)
      return
    }

    if (isSubmitting) {
      return
    }

    if (status === "streaming") {
      stop()
      return
    }

    onSend()
  }, [isSubmitting, onSend, status, stop, disabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) {
        e.preventDefault()
        // Trigger auth popup when trying to type while disabled
        const triggerAuthEvent = new CustomEvent('triggerAuth')
        window.dispatchEvent(triggerAuthEvent)
        return
      }

      if (isSubmitting) {
        e.preventDefault()
        return
      }

      if (e.key === "Enter" && status === "streaming") {
        e.preventDefault()
        return
      }

      if (e.key === "Enter" && !e.shiftKey) {
        if (isOnlyWhitespace(value)) {
          return
        }

        e.preventDefault()
        onSend()
      }
    },
    [isSubmitting, onSend, status, value, disabled]
  )

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const hasImageContent = Array.from(items).some((item) =>
        item.type.startsWith("image/")
      )

      if (!isUserAuthenticated && hasImageContent) {
        e.preventDefault()
        return
      }

      if (isUserAuthenticated && hasImageContent) {
        const imageFiles: File[] = []

        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile()
            if (file) {
              const newFile = new File(
                [file],
                `pasted-image-${Date.now()}.${file.type.split("/")[1]}`,
                { type: file.type }
              )
              imageFiles.push(newFile)
            }
          }
        }

        if (imageFiles.length > 0) {
          onFileUpload(imageFiles)
        }
      }
      // Text pasting will work by default for everyone
    },
    [isUserAuthenticated, onFileUpload]
  )

  // Removed the useMemo that was handling enableSearch since it's no longer needed

  return (
    <div className="relative flex w-full flex-col gap-4">
      <div className="relative order-2 px-2 pb-3 sm:pb-4 md:order-1">
        <PromptInput
          className="border-input rounded-3xl border bg-popover relative z-10 p-0 pt-1 shadow-xs backdrop-blur-xl"
          maxHeight={200}
          value={value}
          onValueChange={onValueChange}
        >
          <FileList files={files} onFileRemove={onFileRemove} />
          
          {useAnimatedPlaceholder && !value.trim() && animatedPlaceholders.length > 0 && (
            <div className="pointer-events-none absolute left-0 top-0 h-6 w-full select-none px-4 pt-4 text-gray-500 dark:text-gray-400">
              <TextLoop interval={3} className="h-6 leading-6 align-middle">
                {animatedPlaceholders.map((text) => (
                  <span key={text} className="block h-6 overflow-hidden text-ellipsis whitespace-nowrap">
                    {text}
                  </span>
                ))}
              </TextLoop>
            </div>
          )}

          <PromptInputTextarea
            placeholder={useAnimatedPlaceholder ? "" : "Ask me anything or search for people in the database..."}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onClick={() => {
              if (disabled) {
                const triggerAuthEvent = new CustomEvent('triggerAuth')
                window.dispatchEvent(triggerAuthEvent)
              }
            }}
            disabled={disabled}
            className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base bg-transparent resize-none"
          />
          
          <PromptInputActions className="mt-5 w-full justify-between px-3 pb-3">
            <div className="flex gap-2">
              <ButtonFileUpload
                onFileUpload={onFileUpload}
                isUserAuthenticated={isUserAuthenticated}
                model={selectedModel}
              />
              <ButtonTools
                selectedService={selectedService}
                onServiceChange={setSelectedService}
              />
              {/* Search button removed - database search is always available */}
            </div>
            <PromptInputAction
              tooltip={status === "streaming" ? "Stop" : "Send"}
            >
              <Button
                size="sm"
                className="size-9 rounded-full transition-all duration-300 ease-out text-white"
                style={{ backgroundColor: '#006DED' }}
                disabled={disabled || !value || isSubmitting || isOnlyWhitespace(value)}
                type="button"
                onClick={handleSend}
                aria-label={status === "streaming" ? "Stop" : "Send message"}
              >
                {status === "streaming" ? (
                  <Square className="size-4" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  )
}
