"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "motion/react"
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/prompt-kit/message"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowUp,
  Copy,
  Globe,
  Mic,
  MoreHorizontal,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trash,
  Pencil,
  Users,
  Shield,
  Eye,
  Scale,
  Vote,
  ExternalLink,
} from "lucide-react"

// Shining Text Animation Component
function ShiningText({ text }: { text: string }) {
  return (
    <motion.span
      className="bg-[linear-gradient(110deg,#666,35%,#fff,50%,#666,75%,#666)] bg-[length:200%_100%] bg-clip-text text-sm font-regular text-transparent"
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: "linear",
      }}
    >
      {text}
    </motion.span>
  )
}

// Circular Progress Chart Component
interface CircularChartProps {
  score: number
  title: string
  size?: number
}

function CircularChart({ score, title, size = 120 }: CircularChartProps) {
  const radius = 45
  const strokeWidth = 6
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getStrokeColor = (score: number) => {
    if (score >= 80) return '#000000' // Black for high scores
    if (score >= 60) return '#666666' // Dark gray for medium scores  
    return '#999999' // Light gray for lower scores
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          height={size}
          width={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            stroke={getStrokeColor(score)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {score}
          </span>
        </div>
      </div>
      {/* Title */}
      <div className="mt-3 text-center">
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          out of 100
        </div>
      </div>
    </div>
  )
}

interface ChatMessage {
  id: number
  role: 'user' | 'assistant' | 'loading'
  content: string
  isTyping?: boolean
  trustScore?: number
  confidenceScore?: number
  showCTA?: boolean
}

export function ChatLandingWindow() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [ctaShown, setCtaShown] = useState(false)

  const generateMockResult = (query: string) => {
    // Extract name from query or use default
    const nameMatch = query.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    const name = nameMatch ? nameMatch[1] : "John Smith"
    
    // Generate realistic scores
    const trustScore = Math.floor(Math.random() * 40) + 60 // 60-100
    const confidenceScore = Math.floor(Math.random() * 30) + 70 // 70-100
    
    return { name, trustScore, confidenceScore }
  }

  const runDemo = async (query: string) => {
    if (isLoading) return
    
    setIsLoading(true)
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: query
    }
    setMessages(prev => [...prev, userMessage])

    const loadingTexts = [
      'Accessing Trust Layer...',
      'Cross-referencing signals...',
      'Calculating score...'
    ]

    // Create single loading message that will update
    const loadingId = Date.now() + 1
    const initialLoadingMessage: ChatMessage = {
      id: loadingId,
      content: loadingTexts[0],
      role: 'loading',
      isTyping: true
    }
    
    setMessages(prev => [...prev, initialLoadingMessage])

    // Cycle through loading texts on the same line
    for (let i = 0; i < loadingTexts.length; i++) {
      // Show typing for current message
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Stop typing animation briefly
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingId ? { ...msg, isTyping: false } : msg
        )
      )
      
      // Short pause before transition (except for last message)
      if (i < loadingTexts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Smoothly update to next message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === loadingId ? { 
              ...msg, 
              content: loadingTexts[i + 1], 
              isTyping: true 
            } : msg
          )
        )
      }
    }

    // Final pause before showing result
    await new Promise(resolve => setTimeout(resolve, 600))

    // Remove loading message and show result
    setMessages(prev => prev.filter(msg => msg.id !== loadingId))
    
    const result = generateMockResult(query)
    const resultMessage: ChatMessage = {
      id: Date.now() + 2,
      role: 'assistant',
      content: `**${result.name}** verification complete`,
      trustScore: result.trustScore,
      confidenceScore: result.confidenceScore,
      showCTA: !ctaShown
    }
    
    setMessages(prev => [...prev, resultMessage])
    setIsLoading(false)
    
    if (!ctaShown) {
      setCtaShown(true)
    }
  }

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return
    
    const query = prompt.trim()
    setPrompt("")
    runDemo(query)
  }

  return (
    <div className="w-full">
      {/* Main Chat Section - Full Viewport */}
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8">
        <div className="w-full max-w-[760px] h-[480px] backdrop-filter backdrop-blur-xl dark:bg-[#121212] bg-white dark:bg-opacity-80 bg-opacity-95 rounded-md relative overflow-hidden">

        {/* Main Chat Content */}
        <div className="flex h-full flex-col overflow-hidden">
          
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                {/* Header */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-tight mb-4">
                  <div>Know Who's Real.</div>
                  <div>Know What's Real.</div>
                </h1>
                
                {/* Subtitle */}
                <p className="text-md md:text-lg font-base text-gray-400 mb-2">
                  The Trust Layer for the Internet.
                </p>
                
              </div>
            </div>
          ) : (
            /* Chat messages */
            <ChatContainerRoot className="relative flex-1 space-y-0 overflow-y-auto px-2">
              <ChatContainerContent className="space-y-6 px-2 py-6">
                {messages.map((message, index) => {
                  const isAssistant = message.role === "assistant" || message.role === "loading"
                  const isLastMessage = index === messages.length - 1

                  return (
                    <Message
                      key={message.id}
                      className={cn(
                        "mx-auto flex w-full max-w-full flex-col gap-2 px-0",
                        isAssistant ? "items-start" : "items-end"
                      )}
                    >
                      {isAssistant ? (
                        <div className="group flex w-full flex-col gap-0">
                          {message.role === "loading" ? (
                            /* Loading message */
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              <div className="flex items-center gap-2">
                                <ShiningText text={message.content} />
                                {message.isTyping && (
                                  <div className="flex space-x-1">
                                    <div className="w-1 h-4 bg-current animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Assistant result message */
                            <div className="w-full">
                              <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-6">
                                <MessageContent
                                  className="text-foreground prose w-full flex-1"
                                  markdown
                                >
                                  {message.content}
                                </MessageContent>
                                
                                {/* Trust Score Charts */}
                                {message.trustScore && (
                                  <div className="mt-6">
                                    <div className="flex justify-center gap-8">
                                      <CircularChart 
                                        score={message.trustScore} 
                                        title="Trust Score"
                                        size={120}
                                      />
                                      <CircularChart 
                                        score={message.confidenceScore || 0} 
                                        title="Confidence Score"
                                        size={120}
                                      />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-4 text-center">
                                      (Sample data for demo purposes)
                                    </div>
                                  </div>
                                )}

                                {/* Conversion Funnel CTA - Only shown for first result */}
                                {message.showCTA && (
                                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4">Move Beyond the Demo</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      {/* Freemium Path */}
                                      <div className="text-center md:text-left">
                                        <h4 className="font-semibold mb-2">See the Truth, For Free</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                          Claim 5 free, real-time verifications. No credit card required.
                                        </p>
                                        <Button className="w-full md:w-auto">
                                          Claim Your 5 Free Verifications
                                        </Button>
                                      </div>
                                      
                                      {/* Pro Path */}
                                      <div className="text-center md:text-left">
                                        <h4 className="font-semibold mb-2">Own the Engine</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                          For professionals and developers.
                                        </p>
                                        <Button variant="outline" className="w-full md:w-auto">
                                          Go Pro & Get API Keys
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Message Actions */}
                              <MessageActions
                                className={cn(
                                  "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                                  isLastMessage && "opacity-100"
                                )}
                              >
                                <MessageAction tooltip="Copy" delayDuration={100}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                  >
                                    <Copy />
                                  </Button>
                                </MessageAction>
                                <MessageAction tooltip="Upvote" delayDuration={100}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                  >
                                    <ThumbsUp />
                                  </Button>
                                </MessageAction>
                                <MessageAction tooltip="Downvote" delayDuration={100}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                  >
                                    <ThumbsDown />
                                  </Button>
                                </MessageAction>
                              </MessageActions>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* User message */
                        <div className="group flex flex-col items-end gap-1">
                          <MessageContent className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[75%]">
                            {message.content}
                          </MessageContent>
                          <MessageActions
                            className={cn(
                              "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                            )}
                          >
                            <MessageAction tooltip="Edit" delayDuration={100}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                              >
                                <Pencil />
                              </Button>
                            </MessageAction>
                            <MessageAction tooltip="Delete" delayDuration={100}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                              >
                                <Trash />
                              </Button>
                            </MessageAction>
                            <MessageAction tooltip="Copy" delayDuration={100}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                              >
                                <Copy />
                              </Button>
                            </MessageAction>
                          </MessageActions>
                        </div>
                      )}
                    </Message>
                  )
                })}
              </ChatContainerContent>
            </ChatContainerRoot>
          )}

          {/* Prompt Input */}
          <div className="shrink-0 px-3 pb-3">
            <PromptInput
              isLoading={isLoading}
              value={prompt}
              onValueChange={setPrompt}
              onSubmit={handleSubmit}
              className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
            >
              <div className="flex flex-col">
                <PromptInputTextarea
                  placeholder="Ask Inverus to verify someone..."
                  className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                />

                <PromptInputActions className="mt-2 flex w-full items-center justify-between gap-2 px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <PromptInputAction tooltip="Verify Identity">
                      <Button variant="outline" className="rounded-full text-xs">
                        <Globe size={16} />
                        Verify
                      </Button>
                    </PromptInputAction>

                    <PromptInputAction tooltip="Trust Score">
                      <Button variant="outline" className="rounded-full text-xs">
                        Trust Score
                      </Button>
                    </PromptInputAction>

                    <PromptInputAction tooltip="More actions">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full"
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </PromptInputAction>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      disabled={!prompt.trim() || isLoading}
                      onClick={handleSubmit}
                      className="size-9 rounded-full"
                    >
                      {!isLoading ? (
                        <ArrowUp size={18} />
                      ) : (
                        <span className="size-3 rounded-xs bg-white" />
                      )}
                    </Button>
                  </div>
                </PromptInputActions>
              </div>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>

    {/* Safety Features Section - Below the fold */}
    <section className="w-full max-w-6xl mx-auto px-4 py-16">
        <div className="grid w-full grid-cols-1 items-stretch gap-8">
          <div className="grid w-full grid-cols-1 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100 text-balance mb-4">
                Leading the way in safety
              </h2>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-balance">
                  We collaborate with industry leaders and policymakers on the issues that matter most.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Child Safety Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col justify-between">
                    <div className="relative flex min-h-6 w-full justify-between">
                      <div className="w-9 h-9">
                        <div className="relative h-full w-full rounded-md flex items-center justify-center">
                          <Users size={24} className="text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="relative items-start">
                        <h4 className="text-xl md:text-2xl tracking-tighter leading-tight mb-2 text-gray-900 dark:text-gray-100">Child safety</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Creating industry-wide standards to protect children.</p>
                      </div>
                      <button 
                        type="button" 
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center rounded-full w-8 h-8 mt-4"
                        aria-label="Learn more"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Private Information Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col justify-between">
                    <div className="relative flex min-h-6 w-full justify-between">
                      <div className="w-9 h-9">
                        <div className="relative h-full w-full rounded-md flex items-center justify-center">
                          <Eye size={24} className="text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="relative items-start">
                        <h4 className="text-xl md:text-2xl tracking-tighter leading-tight mb-2 text-gray-900 dark:text-gray-100">Private information</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Protecting people's privacy.</p>
                      </div>
                      <button 
                        type="button" 
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center rounded-full w-8 h-8 mt-4"
                        aria-label="Learn more"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deep Fakes Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col justify-between">
                    <div className="relative flex min-h-6 w-full justify-between">
                      <div className="w-9 h-9">
                        <div className="relative h-full w-full rounded-md flex items-center justify-center">
                          <Shield size={24} className="text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="relative items-start">
                        <h4 className="text-xl md:text-2xl tracking-tighter leading-tight mb-2 text-gray-900 dark:text-gray-100">Deep fakes</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Improving transparency in AI content.</p>
                      </div>
                      <button 
                        type="button" 
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center rounded-full w-8 h-8 mt-4"
                        aria-label="Learn more"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full mt-4">
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bias Card */}
                <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                  <div className="h-full w-full">
                    <div className="flex h-full w-full flex-col justify-between">
                      <div className="relative flex min-h-6 w-full justify-between">
                        <div className="w-9 h-9">
                          <div className="relative h-full w-full rounded-md flex items-center justify-center">
                            <Scale size={24} className="text-gray-700 dark:text-gray-300" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="relative items-start">
                          <h4 className="text-xl md:text-2xl tracking-tighter leading-tight mb-2 text-gray-900 dark:text-gray-100">Bias</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Rigorously evaluating content to avoid reinforcing biases or stereotypes.</p>
                        </div>
                        <button 
                          type="button" 
                          className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center rounded-full w-8 h-8 mt-4"
                          aria-label="Learn more"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Elections Card */}
                <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                  <div className="h-full w-full">
                    <div className="flex h-full w-full flex-col justify-between">
                      <div className="relative flex min-h-6 w-full justify-between">
                        <div className="w-9 h-9">
                          <div className="relative h-full w-full rounded-md flex items-center justify-center">
                            <Vote size={24} className="text-gray-700 dark:text-gray-300" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="relative items-start">
                          <h4 className="text-xl md:text-2xl tracking-tighter leading-tight mb-2 text-gray-900 dark:text-gray-100">Elections</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Partnering with governments to combat disinformation globally.</p>
                        </div>
                        <button 
                          type="button" 
                          className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center rounded-full w-8 h-8 mt-4"
                          aria-label="Learn more"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teach, Test, Share Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16">
        <div className="grid w-full grid-cols-1 items-stretch gap-8">
          <div className="w-full">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Teach Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col justify-between">
                    <div className="relative flex min-h-6 w-full justify-between">
                      <div className="break-words">
                                                 <h2 className="text-xl md:text-2xl lg:text-3xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100">Teach</h2>
                      </div>
                    </div>
                    
                    <div className="mt-4 relative">
                      <div className="pointer-events-none w-full group-hover:scale-105 transform-gpu transition-transform ease-out duration-300 relative aspect-square">
                        <div className="relative h-full w-full">
                          <div className="w-full aspect-square">
                            <div className="relative w-full aspect-square bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center">
                              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-l-[6px] border-l-blue-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="absolute bottom-0 left-0 right-0 top-0" type="button" aria-label="Play video"></button>
                    </div>
                    
                    <div className="mt-4">
                      <div className="relative items-start">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          We start by teaching our AI right from wrong, filtering harmful content and responding with empathy.
                        </p>
                      </div>
                      <button 
                        type="button" 
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center rounded-full w-8 h-8 mt-4"
                        aria-label="Learn more"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col justify-between">
                    <div className="relative flex min-h-6 w-full justify-between">
                      <div className="break-words">
                                                 <h2 className="text-xl md:text-2xl lg:text-3xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100">Test</h2>
                      </div>
                    </div>
                    
                    <div className="mt-4 relative">
                      <div className="pointer-events-none w-full group-hover:scale-105 transform-gpu transition-transform ease-out duration-300 relative aspect-square">
                        <div className="relative h-full w-full">
                          <div className="w-full aspect-square">
                            <div className="relative w-full aspect-square bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg flex items-center justify-center">
                              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-l-[6px] border-l-green-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="absolute bottom-0 left-0 right-0 top-0" type="button" aria-label="Play video"></button>
                    </div>
                    
                    <div className="mt-4">
                      <div className="relative items-start">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          We conduct internal evaluations and work with experts to test real-world scenarios, enhancing our safeguards.
                        </p>
                      </div>
                      <button 
                        type="button" 
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center rounded-full w-8 h-8 mt-4"
                        aria-label="Learn more"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col justify-between">
                    <div className="relative flex min-h-6 w-full justify-between">
                      <div className="break-words">
                                                 <h2 className="text-xl md:text-2xl lg:text-3xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100">Share</h2>
                      </div>
                    </div>
                    
                    <div className="mt-4 relative">
                      <div className="pointer-events-none w-full group-hover:scale-105 transform-gpu transition-transform ease-out duration-300 relative aspect-square">
                        <div className="relative h-full w-full">
                          <div className="w-full aspect-square">
                            <div className="relative w-full aspect-square bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg flex items-center justify-center">
                              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-l-[6px] border-l-purple-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="absolute bottom-0 left-0 right-0 top-0" type="button" aria-label="Play video"></button>
                    </div>
                    
                    <div className="mt-4">
                      <div className="relative items-start">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          We use real-world feedback to help make our AI safer and more helpful.
                        </p>
                      </div>
                      <button 
                        type="button" 
                        className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center rounded-full w-8 h-8 mt-4"
                        aria-label="Learn more"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16">
        <div className="w-full">
          <div className="bg-gray-50 dark:bg-gray-900 py-16 grid grid-cols-12 rounded-lg">
            <div className="px-4 md:px-0 md:col-span-8 md:col-start-3 col-span-12 flex flex-col">
                             <h2 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-tight text-center text-gray-900 dark:text-gray-100 mb-6">
                 Get started with Inverus
               </h2>
              <div className="flex items-center justify-center flex-col">
                <div className="gap-3 pt-4 flex flex-row flex-wrap items-center justify-center">
                  <Button 
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-3 rounded-full transition duration-200"
                  >
                    Start Verifying
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-3 rounded-full transition duration-200"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-16">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Our Technology */}
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 font-semibold mb-4">Our Technology</span>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Verification Engine
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Trust Scoring
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Identity Validation
                  </a>
                </li>
              </ul>
            </div>

            {/* Platform */}
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 font-semibold mb-4">Platform</span>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Platform Overview
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    API Access
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Documentation
                    <ExternalLink size={14} />
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 font-semibold mb-4">Company</span>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Press
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 font-semibold mb-4">Legal</span>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
            
            {/* Social Links */}
            <div className="flex justify-center md:justify-start gap-4">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition duration-200" aria-label="X">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 16 16" fill="none">
                  <path d="M11.8187 2H13.8544L9.407 7.08308L14.639 14H10.5424L7.33377 9.80492L3.66239 14H1.62547L6.38239 8.56308L1.36331 2H5.56393L8.46424 5.83446L11.8187 2ZM11.1042 12.7815H12.2322L4.951 3.15446H3.74054L11.1042 12.7815Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition duration-200" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.1 2H2.9C2.66131 2 2.43239 2.09482 2.2636 2.2636C2.09482 2.43239 2 2.66131 2 2.9V13.1C2 13.3387 2.09482 13.5676 2.2636 13.7364C2.43239 13.9052 2.66131 14 2.9 14H13.1C13.3387 14 13.5676 13.9052 13.7364 13.7364C13.9052 13.5676 14 13.3387 14 13.1V2.9C14 2.66131 13.9052 2.43239 13.7364 2.2636C13.5676 2.09482 13.3387 2 13.1 2ZM5.6 12.2H3.8V6.8H5.6V12.2ZM4.7 5.75C4.49371 5.7441 4.29373 5.67755 4.12505 5.55865C3.95637 5.43974 3.82647 5.27377 3.75158 5.08147C3.67669 4.88916 3.66012 4.67905 3.70396 4.47738C3.7478 4.27572 3.8501 4.09144 3.99807 3.94758C4.14604 3.80372 4.33312 3.70666 4.53594 3.66852C4.73876 3.63038 4.94832 3.65285 5.13844 3.73313C5.32856 3.8134 5.49081 3.94793 5.60491 4.11989C5.71902 4.29185 5.77992 4.49363 5.78 4.7C5.77526 4.98221 5.659 5.25107 5.45663 5.44782C5.25426 5.64457 4.98223 5.75321 4.7 5.75ZM12.2 12.2H10.4V9.356C10.4 8.504 10.04 8.198 9.572 8.198C9.43479 8.20714 9.30073 8.24329 9.17753 8.30439C9.05433 8.36548 8.94441 8.45032 8.85409 8.55402C8.76377 8.65771 8.69483 8.77824 8.65123 8.90866C8.60762 9.03908 8.59021 9.17683 8.6 9.314C8.59702 9.34192 8.59702 9.37008 8.6 9.398V12.2H6.8V6.8H8.54V7.58C8.71552 7.313 8.95666 7.09554 9.24031 6.94846C9.52397 6.80138 9.84065 6.7296 10.16 6.74C11.09 6.74 12.176 7.256 12.176 8.936L12.2 12.2Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition duration-200" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.99998 1.30048C11.6833 1.30048 14.6666 4.28381 14.6666 7.96714C14.6663 9.36398 14.2279 10.7255 13.4132 11.8602C12.5985 12.9948 11.4484 13.8454 10.125 14.2921C9.79165 14.3588 9.66665 14.1505 9.66665 13.9755C9.66665 13.7505 9.67498 13.0338 9.67498 12.1421C9.67498 11.5171 9.46665 11.1171 9.22498 10.9088C10.7083 10.7421 12.2666 10.1755 12.2666 7.61714C12.2666 6.88381 12.0083 6.29214 11.5833 5.82548C11.65 5.65881 11.8833 4.97548 11.5166 4.05881C11.5166 4.05881 10.9583 3.87548 9.68331 4.74214C9.14998 4.59214 8.58331 4.51714 8.01665 4.51714C7.44998 4.51714 6.88331 4.59214 6.34998 4.74214C5.07498 3.88381 4.51665 4.05881 4.51665 4.05881C4.14998 4.97548 4.38331 5.65881 4.44998 5.82548C4.02498 6.29214 3.76665 6.89214 3.76665 7.61714C3.76665 10.1671 5.31665 10.7421 6.79998 10.9088C6.60831 11.0755 6.43331 11.3671 6.37498 11.8005C5.99165 11.9755 5.03331 12.2588 4.43331 11.2505C4.30831 11.0505 3.93331 10.5588 3.40831 10.5671C2.84998 10.5755 3.18331 10.8838 3.41665 11.0088C3.69998 11.1671 4.02498 11.7588 4.09998 11.9505C4.23331 12.3255 4.66665 13.0421 6.34165 12.7338C6.34165 13.2921 6.34998 13.8171 6.34998 13.9755C6.34998 14.1505 6.22498 14.3505 5.89165 14.2921C4.56385 13.8502 3.40893 13.0013 2.59072 11.866C1.77252 10.7307 1.33258 9.36657 1.33331 7.96714C1.33331 4.28381 4.31665 1.30048 7.99998 1.30048Z" fill="currentColor"/>
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-left">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Inverus © 2024–2025
              </span>
            </div>

            {/* Language Selector */}
            <div className="text-center md:text-right">
              <Button 
                variant="outline" 
                size="sm"
                className="text-sm px-4 py-2 rounded-full border-gray-300 dark:border-gray-600"
              >
                <span className="flex items-center gap-2">
                  English <span className="text-gray-500">United States</span>
                </span>
              </Button>
            </div>

          </div>
        </div>
      </footer>
    </div>
  )
} 