import {
  Message,
  MessageContent,
} from "@/components/prompt-kit/message"
import { useUserPreferences } from "@/lib/user-preference-store/provider"
import { cn } from "@/lib/utils"
import type { Message as MessageAISDK } from "@ai-sdk/react"
import { RotateCcw, Copy, Share, ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { DialogPublish } from "@/app/components/layout/dialog-publish"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getSources } from "./get-sources"
import { Reasoning } from "./reasoning"
import { SearchImages } from "./search-images"
import { SourcesList } from "./sources-list"
import { useMemo, useState } from "react"
import { CircularChart } from "@/components/common/circular-chart"
import { LoaderCircle } from "lucide-react"

// Function to mask sensitive data in message content for unauthenticated users
function maskMessageContent(content: string, isAuthenticated?: boolean): string {
  if (isAuthenticated) {
    return content
  }

  // Mask email addresses
  let maskedContent = content.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    "******@******.com"
  )

  // Mask phone numbers (various formats)
  maskedContent = maskedContent.replace(
    /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    "***-***-****"
  )

  // Mask complete addresses including cities and states
  maskedContent = maskedContent.replace(
    /\b\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl)[^,\n]*,?\s*[A-Za-z\s]*,?\s*[A-Z]{2}?\s*\d{5}?(-\d{4})?\b/gi,
    "*** ****** ******, *****, **"
  )

  // Mask simpler addresses (just street)
  maskedContent = maskedContent.replace(
    /\b\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl)\b/gi,
    "*** ****** ******"
  )

  // Mask city, state patterns
  maskedContent = maskedContent.replace(
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}\b/g,
    "*****, **"
  )

  // Mask ZIP codes
  maskedContent = maskedContent.replace(/\b\d{5}(-\d{4})?\b/g, "*****")

  // Mask any remaining numeric scores or ratings (enhanced patterns)
  maskedContent = maskedContent.replace(
    /\b(?:Trust\s*Score|Confidence\s*Score|Quality\s*Score|Data\s*Quality|Score|Rating|Trust|Confidence):\s*\d+(?:\.\d+)?(?:\s*\(out\s*of\s*\d+\)|%|\s*\/\s*\d+)?\b/gi,
    (match) => {
      const label = match.split(':')[0]
      return `${label}: ***`
    }
  )

  // Mask standalone scores with decimal points
  maskedContent = maskedContent.replace(
    /\b\d+\.\d+(?:\s*\(out\s*of\s*\d+\)|\s*out\s*of\s*\d+)\b/gi,
    "***"
  )

  // Mask confidence/reliability indicators
  maskedContent = maskedContent.replace(
    /This indicates?\s+(?:a\s+)?(?:high|medium|low|very|extremely)?\s*(?:confidence|reliability|accuracy)[\s\w\.,]*(?:record|data|information|profile)/gi,
    "This indicates *** confidence in the *** of this record"
  )

  // Mask numerical percentages in scoring context
  maskedContent = maskedContent.replace(
    /\b\d+(?:\.\d+)?%\s*(?:confidence|accuracy|reliability|match|score)/gi,
    "***% ***"
  )

  // Mask Social Security Numbers
  maskedContent = maskedContent.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "***-**-****")

  // Mask credit card numbers
  maskedContent = maskedContent.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "****-****-****-****")

  // Mask names that appear to be full names (First Last pattern)
  maskedContent = maskedContent.replace(
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
    (match) => {
      // Don't mask if it's likely a company or common terms
      const commonTerms = [
        'United States', 'New York', 'Los Angeles', 'San Francisco', 'User Profile', 
        'Data Found', 'Search Results', 'Trust Score', 'Identity Verification',
        'Digital Identity', 'Found Profile', 'Data Quality', 'Confidence Score',
        'North America', 'South America', 'New Jersey', 'New Mexico'
      ]
      if (commonTerms.some(term => match.includes(term))) {
        return match
      }
      return "****** ******"
    }
  )

  // Mask any remaining personal identifiers in various formats
  maskedContent = maskedContent.replace(
    /\b(?:Name|First Name|Last Name|Full Name):\s*[^\n,]+/gi,
    (match) => {
      const label = match.split(':')[0]
      return `${label}: ******`
    }
  )

  // Mask LinkedIn profiles and social media
  maskedContent = maskedContent.replace(
    /(?:linkedin\.com\/in\/|@)[a-zA-Z0-9._-]+/gi,
    "******"
  )

  // Mask any remaining location data
  maskedContent = maskedContent.replace(
    /\b[A-Z][a-z]+,\s*[A-Z]{2}\s*\d{5}/g,
    "*****, ** *****"
  )

  // Mask specific personal identifiers in structured data
  maskedContent = maskedContent.replace(
    /"(name|email|phone|address|ssn)"\s*:\s*"[^"]+"/gi,
    (match, field) => `"${field}": "******"`
  )

  return maskedContent
}


type IdentityScoringPart = {
  type: "identity-scoring"
  query: string
  count: number
  results: any[]
  top: any | null
}

type MessageAssistantProps = {
  children: string
  isLast?: boolean
  hasScrollAnchor?: boolean
  copied?: boolean
  copyToClipboard?: () => void
  onReload?: () => void
  parts?: MessageAISDK["parts"]
  status?: "streaming" | "ready" | "submitted" | "error"
  isAuthenticated?: boolean
  onSignIn?: () => void
}

export function MessageAssistant({
  children,
  isLast,
  hasScrollAnchor,
  copied,
  copyToClipboard,
  onReload,
  parts,
  status,
  isAuthenticated,
  onSignIn,
}: MessageAssistantProps) {
  const { preferences } = useUserPreferences()
  const [voteState, setVoteState] = useState<'upvote' | 'downvote' | null>(null)
  const [pressedButton, setPressedButton] = useState<string | null>(null)

  // Handle vote actions
  const handleUpvote = () => {
    setVoteState(voteState === 'upvote' ? null : 'upvote')
    animatePress('upvote')
  }

  const handleDownvote = () => {
    setVoteState(voteState === 'downvote' ? null : 'downvote')
    animatePress('downvote')
  }

  // Handle press animations
  const animatePress = (buttonId: string) => {
    setPressedButton(buttonId)
    setTimeout(() => setPressedButton(null), 150)
  }

  // Enhanced click handlers with animations
  const handleCopyWithAnimation = () => {
    animatePress('copy')
    copyToClipboard?.()
  }

  const handleRetryWithAnimation = () => {
    animatePress('retry')
    onReload?.()
  }
  const sources = getSources(parts)
  const identityScoring = useMemo(() => {
    const p = parts?.find((part: any) => {
      if (part?.type !== "tool-invocation") return false
      const content = part?.toolInvocation?.result?.content
      if (!Array.isArray(content)) return false
      return content.some((c: any) => c?.type === "identity-scoring")
    }) as any
    const contentArr = p?.toolInvocation?.result?.content as any[] | undefined
    const scoring = contentArr?.find((c: any) => c?.type === "identity-scoring") as IdentityScoringPart | undefined
    return scoring
  }, [parts])

  const reasoningParts = parts?.find((part) => part.type === "reasoning")
  const contentNullOrEmpty = children === null || children === ""
  const isLastStreaming = status === "streaming" && isLast
  const searchImageResults =
    parts
      ?.filter(
        (part) =>
          part.type === "tool-invocation" &&
          part.toolInvocation?.state === "result" &&
          part.toolInvocation?.toolName === "imageSearch" &&
          part.toolInvocation?.result?.content?.[0]?.type === "images"
      )
      .flatMap((part) =>
        part.type === "tool-invocation" &&
        part.toolInvocation?.state === "result" &&
        part.toolInvocation?.toolName === "imageSearch" &&
        part.toolInvocation?.result?.content?.[0]?.type === "images"
          ? (part.toolInvocation?.result?.content?.[0]?.results ?? [])
          : []
      ) ?? []

  return (
    <Message
      className={cn(
        "group flex w-full max-w-3xl flex-1 items-start gap-4 px-6 pb-2",
        hasScrollAnchor && "min-h-scroll-anchor"
      )}
    >
      <div className={cn("flex min-w-full flex-col gap-2", isLast && "pb-8")}>
        {reasoningParts && reasoningParts.reasoning && (
          <Reasoning
            reasoning={reasoningParts.reasoning}
            isStreaming={status === "streaming"}
          />
        )}



        {searchImageResults.length > 0 && (
          <SearchImages results={searchImageResults} />
        )}

        {contentNullOrEmpty ? null : (
          <MessageContent
            className={cn(
              "prose dark:prose-invert relative min-w-full bg-transparent p-0",
              "prose-h1:scroll-m-20 prose-h1:text-2xl prose-h1:font-semibold prose-h2:mt-8 prose-h2:scroll-m-20 prose-h2:text-xl prose-h2:mb-3 prose-h2:font-medium prose-h3:scroll-m-20 prose-h3:text-base prose-h3:font-medium prose-h4:scroll-m-20 prose-h5:scroll-m-20 prose-h6:scroll-m-20 prose-strong:font-medium prose-table:block prose-table:overflow-y-auto"
            )}
            markdown={true}
          >
            {maskMessageContent(children, isAuthenticated)}
          </MessageContent>
        )}

        {/* Identity scoring charts: render only after text streaming finishes */}
        {(!isLastStreaming && identityScoring?.top) && (
          <div className="mt-6">
            <div className="flex justify-center gap-8">
              <CircularChart
                score={Math.round(identityScoring?.top?.TSRaw)}
                title="Trust Score"
                size={120}
                maskedValue={!isAuthenticated ? "***" : undefined}
              />
              <CircularChart
                score={Math.round(identityScoring?.top?.CS)}
                title="Confidence Score"
                size={120}
                maskedValue={!isAuthenticated ? "***" : undefined}
              />
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Based on inVerus Digital Identity Scoring
            </div>
          </div>
        )}

        {sources && sources.length > 0 && <SourcesList sources={sources} />}

        {Boolean(isLastStreaming || contentNullOrEmpty) ? null : (
          <TooltipProvider>
            <div className="flex items-center gap-1 justify-start">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-full h-8 w-8",
                    pressedButton === 'retry' && "scale-95 bg-accent"
                  )}
                  type="submit" 
                  aria-label="Retry from message"
                  onClick={handleRetryWithAnimation}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="sr-only">Retry</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Retry</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-full h-8 w-8",
                    pressedButton === 'copy' && "scale-95 bg-accent"
                  )}
                  onClick={handleCopyWithAnimation}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="sr-only">Copy message</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
            </Tooltip>
            <DialogPublish 
              trigger={({ isLoading, onClick }) => (
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background hover:bg-accent transition"
                  onClick={onClick}
                  disabled={isLoading}
                  aria-label="Share"
                >
                  {isLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Share className="h-4 w-4" />
                  )}
                </button>
              )}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground rounded-full h-8 w-8",
                    voteState === 'upvote' && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                    pressedButton === 'upvote' && "scale-95"
                  )}
                  type="button" 
                  onClick={handleUpvote}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="sr-only">Upvote</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>{voteState === 'upvote' ? "Remove upvote" : "Upvote"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground rounded-full h-8 w-8",
                    voteState === 'downvote' && "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                    pressedButton === 'downvote' && "scale-95"
                  )}
                  type="button" 
                  onClick={handleDownvote}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="sr-only">Downvote</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>{voteState === 'downvote' ? "Remove downvote" : "Downvote"}</TooltipContent>
            </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>
    </Message>
  )
}
