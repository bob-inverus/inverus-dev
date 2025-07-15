import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { getAllModels } from "@/lib/models"
import { getProviderForModel } from "@/lib/openproviders/provider-map"
import { searchUserDataTool } from "@/lib/tools/search-tool"
import type { ProviderWithoutOllama } from "@/lib/user-keys"
import { Attachment } from "@ai-sdk/ui-utils"
import { Message as MessageAISDK, streamText, ToolSet } from "ai"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/app/types/database.types"
import {
  logUserMessage,
  storeAssistantMessage,
  validateAndTrackUsage,
} from "./api"
import { createErrorResponse, extractErrorMessage } from "./utils"

export const maxDuration = 60

type ChatRequest = {
  messages: MessageAISDK[]
  chatId: string
  userId: string
  model: string
  isAuthenticated: boolean
  systemPrompt: string
  enableSearch: boolean
}

// Function to generate a meaningful title from the first user message
function generateTitleFromMessage(message: string): string {
  // Remove extra whitespace and limit length
  const cleanMessage = message.trim().replace(/\s+/g, ' ')
  
  // If message is short enough, use it directly
  if (cleanMessage.length <= 50) {
    return cleanMessage
  }
  
  // For longer messages, take first 50 characters and add ellipsis
  return cleanMessage.substring(0, 47) + '...'
}

// Function to update chat title if it's still "New Chat"
async function updateChatTitleIfNeeded(
  supabase: SupabaseClient<Database>,
  chatId: string,
  messages: MessageAISDK[]
): Promise<void> {
  try {
    // Get current chat title
    const { data: chat, error: fetchError } = await supabase
      .from("chats")
      .select("title")
      .eq("id", chatId)
      .single()
    
    if (fetchError || !chat) {
      console.error("Error fetching chat for title update:", fetchError)
      return
    }
    
    // Only update if title is still "New Chat"
    if (chat.title !== "New Chat") {
      return
    }
    
    // Find the first user message
    const firstUserMessage = messages.find(msg => msg.role === "user")
    if (!firstUserMessage || typeof firstUserMessage.content !== "string") {
      return
    }
    
    // Generate new title from first message
    const newTitle = generateTitleFromMessage(firstUserMessage.content)
    
    // Update the chat title
    const { error: updateError } = await supabase
      .from("chats")
      .update({ title: newTitle, updated_at: new Date().toISOString() })
      .eq("id", chatId)
    
    if (updateError) {
      console.error("Error updating chat title:", updateError)
    } else {
      console.log(`Updated chat title to: "${newTitle}"`)
    }
  } catch (error) {
    console.error("Error in updateChatTitleIfNeeded:", error)
  }
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      chatId,
      userId,
      model,
      isAuthenticated,
      systemPrompt,
      enableSearch,
    } = (await req.json()) as ChatRequest

    if (!messages || !chatId || !userId) {
      return new Response(
        JSON.stringify({ error: "Error, missing information" }),
        { status: 400 }
      )
    }

    const supabase = await validateAndTrackUsage({
      userId,
      model,
      isAuthenticated,
    })

    const userMessage = messages[messages.length - 1]

    if (supabase && userMessage?.role === "user") {
      await logUserMessage({
        supabase,
        userId,
        chatId,
        content: userMessage.content,
        attachments: userMessage.experimental_attachments as Attachment[],
        model,
        isAuthenticated,
      })
    }

    const allModels = await getAllModels()
    let modelConfig = allModels.find((m) => m.id === model)

    // Fallback to default model if requested model is not found
    if (!modelConfig || !modelConfig.apiSdk) {
      const { MODEL_FALLBACK } = await import("@/lib/config")
      console.warn(`Model ${model} not found, falling back to ${MODEL_FALLBACK}`)
      modelConfig = allModels.find((m) => m.id === MODEL_FALLBACK)
      
      if (!modelConfig || !modelConfig.apiSdk) {
        throw new Error(`Model ${model} not found and fallback model ${MODEL_FALLBACK} also not available`)
      }
    }

    const effectiveSystemPrompt = systemPrompt || SYSTEM_PROMPT_DEFAULT

    let apiKey: string | undefined
    if (isAuthenticated && userId) {
      const { getEffectiveApiKey } = await import("@/lib/user-keys")
      const provider = getProviderForModel(model)
      apiKey =
        (await getEffectiveApiKey(userId, provider as ProviderWithoutOllama)) ||
        undefined
    }

    // Always include search tool for database queries
    const tools: ToolSet = {
      searchUserData: searchUserDataTool,
    }

    const result = streamText({
      model: modelConfig.apiSdk(apiKey, { enableSearch }),
      system: effectiveSystemPrompt,
      messages: messages,
      tools,
      maxSteps: 10,
      onError: (err: unknown) => {
        console.error("Streaming error occurred:", err)
        // Don't set streamError anymore - let the AI SDK handle it through the stream
      },

      onFinish: async ({ response }) => {
        if (supabase) {
          await storeAssistantMessage({
            supabase,
            chatId,
            messages:
              response.messages as unknown as import("@/app/types/api.types").Message[],
          })
          
          // Auto-update chat title if it's still "New Chat"
          await updateChatTitleIfNeeded(supabase, chatId, messages)
        }
      },
    })

    return result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
      getErrorMessage: (error: unknown) => {
        console.error("Error forwarded to client:", error)
        return extractErrorMessage(error)
      },
    })
  } catch (err: unknown) {
    console.error("Error in /api/chat:", err)
    const error = err as {
      code?: string
      message?: string
      statusCode?: number
    }

    return createErrorResponse(error)
  }
}
