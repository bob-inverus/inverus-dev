"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"

import { Loader } from "@/components/prompt-kit/loader"
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
import { LogoCarousel } from "@/components/ui/logo-carousel"
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
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { TeamSlide } from "@/app/components/team-slide"



function CountingNumber({ target }: { target: number }) {
  const [count, setCount] = useState(target)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Live counting - increment randomly every 2-5 seconds
    const scheduleNextIncrement = () => {
      const randomDelay = Math.random() * 3000 + 2000 // 2-5 seconds
      timeoutRef.current = setTimeout(() => {
        setCount(prevCount => {
          // Add 1-3 verifications randomly
          const increment = Math.floor(Math.random() * 3) + 1
          return prevCount + increment
        })
        scheduleNextIncrement() // Schedule the next increment
      }, randomDelay)
    }

    scheduleNextIncrement()

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <span className="font-mono">
      {count.toLocaleString()}
    </span>
  )
}

// Circular Progress Chart Component with Animation
interface CircularChartProps {
  score: number
  title: string
  size?: number
}

function CircularChart({ score, title, size = 120 }: CircularChartProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedOffset, setAnimatedOffset] = useState(0)
  
  const radius = 45
  const strokeWidth = 6
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`

  const getStrokeColor = (title: string) => {
    if (title === 'Trust Score') return '#3b82f6' // Brand blue for Trust Score
    if (title === 'Confidence Score') return '#6b7280' // Muted gray for Confidence Score
    return '#6b7280' // Default muted gray
  }

  useEffect(() => {
    // Start animation after a brief delay
    const startDelay = setTimeout(() => {
      const duration = 2000 // 2 seconds
      const steps = 60 // 60 steps for smooth animation
      const stepDuration = duration / steps
      const scoreIncrement = score / steps
      const offsetStart = circumference
      const offsetEnd = circumference - (score / 100) * circumference
      const offsetDecrement = (offsetStart - offsetEnd) / steps

      let currentStep = 0
      
      const animate = () => {
        if (currentStep <= steps) {
          const progress = currentStep / steps
          // Easing function for smooth animation
          const easeOutCubic = 1 - Math.pow(1 - progress, 3)
          
          const newScore = Math.round(score * easeOutCubic)
          const newOffset = offsetStart - (offsetDecrement * steps * easeOutCubic)
          
          setAnimatedScore(newScore)
          setAnimatedOffset(newOffset)
          
          currentStep++
          setTimeout(animate, stepDuration)
        }
      }
      
      animate()
    }, 300) // 300ms delay before starting

    return () => clearTimeout(startDelay)
  }, [score, circumference])

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
          {/* Animated Progress circle */}
          <circle
            stroke={getStrokeColor(title)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset: animatedOffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
            className="transition-none" // Remove CSS transition since we're manually animating
          />
        </svg>
        {/* Animated Score text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {animatedScore}
          </span>
          <span className="text-sm font-medium text-gray-500 ml-0.5">
            %
          </span>
        </div>
      </div>
      {/* Title */}
      <div className="mt-3 text-center">
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {title}
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
  const [showScrollArrow, setShowScrollArrow] = useState(true)
  const [currentSection, setCurrentSection] = useState(1)
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  const [isTeamSlideOpen, setIsTeamSlideOpen] = useState(false)

  // Debug current section changes
  useEffect(() => {
    console.log(`Current section changed to: ${currentSection}, Show arrow: ${showScrollArrow}`)
  }, [currentSection, showScrollArrow])

  // ChatGPT-style sliding placeholder animation with smooth infinite cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex(prev => (prev + 1) % 6)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  // Handle section detection using Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Only trigger when section is in middle 50% of viewport
      threshold: 0
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          console.log(`Section in view: ${sectionId}`)
          
          switch (sectionId) {
            case 'chat-demo-section':
              setCurrentSection(1)
              setShowScrollArrow(true)
              break
            case 'trust-protocol-section':
              setCurrentSection(2)
              setShowScrollArrow(true)
              break
            case 'architecture-section':
              setCurrentSection(3)
              setShowScrollArrow(true)
              break
            case 'cta-section':
              setCurrentSection(4)
              setShowScrollArrow(false)
              break
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections
    const sections = [
      'chat-demo-section',
      'trust-protocol-section', 
      'architecture-section',
      'cta-section'
    ]

    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Get the target section ID based on current section
  const getNextSectionId = () => {
    switch (currentSection) {
      case 1: return 'trust-protocol-section'
      case 2: return 'architecture-section' 
      case 3: return 'cta-section'
      default: return 'trust-protocol-section'
    }
  }

  // Handle arrow click with debugging
  const handleArrowClick = () => {
    const targetId = getNextSectionId()
    const scrollY = window.scrollY
    
    console.log(`=== ARROW CLICK DEBUG ===`)
    console.log(`Current scroll position: ${scrollY}px`)
    console.log(`Current section: ${currentSection}`)
    console.log(`Targeting: ${targetId}`)
    
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      const targetPosition = targetElement.offsetTop
      console.log(`Target element position: ${targetPosition}px`)
      console.log('Scrolling to target...')
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    } else {
      console.error(`Target element not found: ${targetId}`)
    }
  }

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

    // Add simple loading message with dots animation
    const loadingId = Date.now() + 1
    const loadingMessage: ChatMessage = {
      id: loadingId,
      content: '',
      role: 'loading',
      isTyping: true
    }
    
    setMessages(prev => [...prev, loadingMessage])

    // Wait for 2-3 seconds to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Remove loading message and show result
    setMessages(prev => prev.filter(msg => msg.id !== loadingId))
    
    const result = generateMockResult(query)
    const resultMessage: ChatMessage = {
      id: Date.now() + 2,
      role: 'assistant',
      content: `**${result.name}**`,
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
      {/* Section 1: Chat Demo Window */}
      <section id="chat-demo-section" className="flex flex-col items-center justify-center h-screen w-full px-4 py-8">
        <div className="w-full max-w-[760px] min-h-[480px] max-h-[80vh] backdrop-filter backdrop-blur-xl rounded-md relative overflow-hidden">

                {/* Main Chat Content */}
        <div className="flex h-full flex-col overflow-hidden">
          
          {messages.length === 0 ? (
            /* Empty state - centered layout */
            <div className="flex flex-1 items-center justify-center flex-col">
              <div className="text-center mb-8">
                {/* Header */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-tight mb-4">
                  <div>Know Who's Real.</div>
                </h1>
                
                {/* Subtitle */}
                <p className="text-md md:text-lg font-base text-gray-400 mb-2">
                  The Trust Layer for the Internet.
                </p>
              </div>
              
              {/* Centered Input for Empty State */}
              <div className="w-full max-w-2xl px-4">
                <PromptInput
                  isLoading={isLoading}
                  value={prompt}
                  onValueChange={setPrompt}
                  onSubmit={handleSubmit}
                  className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
                >
                  <div className="flex flex-col">
                    {/* ChatGPT-style animated placeholder - hide when typing */}
                    {!prompt.trim() && (
                      <div className="pointer-events-none absolute left-0 top-0 w-full select-none px-4 pt-4 text-gray-500 dark:text-gray-400">
                        <div 
                          className="transition-transform duration-700"
                          style={{ 
                            transform: `translateY(-${currentPlaceholderIndex * 1.5}rem)`,
                            transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                          }}
                        >
                          {[
                            "Ask InVerus to verify someone...",
                            "Try \"Jasmine Kaur\" or \"Elon Musk\"",
                            "Curious how someone shows up online?",
                            "Run a sample Trust Score.",
                            "What's their digital signal say?",
                            "Don't guess. Check the signal."
                          ].map((text, index) => (
                            <div
                              key={index}
                              className={`overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-500 h-6 ${
                                index === currentPlaceholderIndex ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              {text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <PromptInputTextarea
                      placeholder=""
                      className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base bg-transparent resize-none"
                    />

                    <PromptInputActions className="mt-2 flex w-full items-center justify-end gap-2 px-3 pb-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          disabled={isLoading}
                          onClick={handleSubmit}
                          className={`size-9 rounded-full transition-colors duration-200 ${
                            prompt.trim() 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-500'
                          }`}
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
          ) : (
            /* Chat with messages - input at bottom */
            <>
              {/* Chat messages */}
              <div className="relative flex-1 space-y-0 px-2 overflow-y-auto">
                <div className="space-y-6 px-2 py-6">{messages.map((message, index) => {
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
                              /* Loading message - exact same as main chat */
                              <div className="group min-h-scroll-anchor flex w-full max-w-3xl flex-col items-start gap-2 px-6 pb-2">
                                <Loader />
                              </div>
                            ) : (
                              /* Assistant result message */
                              <div className="w-full">
                                <div className="flex gap-3">
                                  {/* Inverus Avatar */}
                                  <div className="flex-shrink-0 mt-1">
                                    <svg width="32" height="32" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg">
                                      <rect width="50" height="50" rx="15" fill="#006DED"/>
                                      <path fillRule="evenodd" clipRule="evenodd" d="M23.7366 6.15368C23.9778 6.05228 24.2376 6 24.5 6C24.7624 6 25.0222 6.05228 25.2634 6.15368L37.6518 11.3612C38.3489 11.6542 38.9431 12.1415 39.3605 12.7626C39.7779 13.3836 40.0003 14.1112 40 14.855V27.888C39.9998 30.2322 39.3676 32.5348 38.1675 34.5623C36.9675 36.5898 35.2422 38.2703 33.1664 39.4334L25.461 43.7498C25.1683 43.9138 24.8371 44 24.5 44C24.1629 44 23.8317 43.9138 23.539 43.7498L15.8336 39.4334C13.7573 38.27 12.0316 36.5889 10.8315 34.5607C9.6314 32.5324 8.99955 30.2291 9 27.8842V14.855C9.00008 14.1115 9.22261 13.3844 9.64002 12.7637C10.0574 12.143 10.6514 11.656 11.3482 11.3631L23.7366 6.15368ZM31.6823 22.5437C32.0352 22.1854 32.2305 21.7055 32.2261 21.2073C32.2217 20.7092 32.0179 20.2327 31.6587 19.8804C31.2995 19.5282 30.8135 19.3284 30.3055 19.3241C29.7975 19.3197 29.3081 19.5112 28.9427 19.8573L22.5625 26.1135L20.0573 23.657C19.6919 23.3109 19.2025 23.1194 18.6945 23.1238C18.1865 23.1281 17.7005 23.3279 17.3413 23.6802C16.9821 24.0324 16.7783 24.5089 16.7739 25.007C16.7695 25.5052 16.9648 25.9851 17.3177 26.3434L21.1927 30.1431C21.556 30.4993 22.0487 30.6994 22.5625 30.6994C23.0763 30.6994 23.569 30.4993 23.9323 30.1431L31.6823 22.5437Z" fill="white"/>
                                    </svg>
                                  </div>
                                  
                                  {/* Message Content */}
                                  <div className="flex-1">
                                    <MessageContent
                                      className="text-foreground prose w-full flex-1 bg-transparent p-0"
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
                                          (This is a sample signal.)
                                        </div>
                                      </div>
                                    )}

                                    {/* Results CTA Block - Only shown for first result */}
                                    {message.showCTA && (
                                      <div className="mt-6 pt-4">
                                        <div className="text-center">
                                          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                                            Your digital presence already speaks before you do.
                                          </h3>
                                          <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                                            See Who's Real. Including You.
                                          </p>
                                          <a href="/auth">
                                            <Button 
                                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs h-9 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-600 dark:hover:bg-gray-200 px-8 py-3 rounded-full transition duration-200"
                                            >
                                              Launch the Trust Layer
                                            </Button>
                                          </a>
                                          <p className="text-sm text-gray-500 dark:text-gray-600 mt-4">
                                            No noise. Just signal.
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
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
                            <MessageContent className="bg-muted text-primary rounded-3xl px-5 py-2.5">
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
                </div>
              </div>

              {/* Bottom Input for Chat State */}
              <div className="shrink-0 px-3 pb-3">
                <PromptInput
                  isLoading={isLoading}
                  value={prompt}
                  onValueChange={setPrompt}
                  onSubmit={handleSubmit}
                  className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
                >
                  <div className="flex flex-col">
                    {/* ChatGPT-style animated placeholder - hide when typing */}
                    {!prompt.trim() && (
                      <div className="pointer-events-none absolute left-0 top-0 w-full select-none px-4 pt-4 text-gray-500 dark:text-gray-400">
                        <div 
                          className="transition-transform duration-700"
                          style={{ 
                            transform: `translateY(-${currentPlaceholderIndex * 1.5}rem)`,
                            transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                          }}
                        >
                          {[
                            "Ask InVerus to verify someone...",
                            "Try \"Jasmine Kaur\" or \"Elon Musk\"",
                            "Curious how someone shows up online?",
                            "Run a sample Trust Score.",
                            "What's their digital signal say?",
                            "Don't guess. Check the signal."
                          ].map((text, index) => (
                            <div
                              key={index}
                              className={`overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-500 h-6 ${
                                index === currentPlaceholderIndex ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              {text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <PromptInputTextarea
                      placeholder=""
                      className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base bg-transparent resize-none"
                    />

                    <PromptInputActions className="mt-2 flex w-full items-center justify-end gap-2 px-3 pb-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          disabled={isLoading}
                          onClick={handleSubmit}
                          className={`size-9 rounded-full transition-colors duration-200 ${
                            prompt.trim() 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-400 dark:bg-gray-700 dark:hover:bg-gray-200 dark:text-gray-500'
                          }`}
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
            </>
          )}
        </div>
      </div>
      </section>


      {/* Section 2: Trust Protocol */}
    <section id="trust-protocol-section" className="flex flex-col items-center justify-center h-screen w-full px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid w-full grid-cols-1 items-stretch gap-8">
          <div className="grid w-full grid-cols-1 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100 text-balance mb-4">
                The inVerus Protocol
              </h2>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-balance text-lg">
                  We don't just build apps. We build the architecture that makes a trusted digital world possible.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Trust Layer Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9">
                        <div className="relative h-full w-full rounded-md flex items-center justify-center">
                          <Shield size={24} className="text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                      <h4 className="text-xl md:text-2xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100">Trust Layer</h4>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Instantly verify humans via API or our web application. The core engine to secure your platform, built to verify content and agents as the web evolves.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sovereignty Layer Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9">
                        <div className="relative h-full w-full rounded-md flex items-center justify-center">
                          <Users size={24} className="text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                      <h4 className="text-xl md:text-2xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100">Sovereignty Layer</h4>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Built on a core belief in digital sovereignty. Explore our philosophy of user-centric control.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agency Layer Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9">
                        <div className="relative h-full w-full rounded-md flex items-center justify-center">
                          <Eye size={24} className="text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                      <h4 className="text-xl md:text-2xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100">Agency Layer</h4>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Unleash powerful AI assistants that act on your behalf, using your own verified data.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exchange Layer Card */}
              <div className="border border-gray-200 dark:border-gray-700 p-6 mb-4 md:mb-0 group relative w-full rounded-md last:mb-0">
                <div className="h-full w-full">
                  <div className="flex h-full w-full flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9">
                        <div className="relative h-full w-full rounded-md flex items-center justify-center">
                          <Globe size={24} className="text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                      <h4 className="text-xl md:text-2xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100">Exchange Layer</h4>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Unlock the value of verified data in a new marketplace for trusted, permission-based exchange.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Section 3: Architecture of Trust */}
      <section id="architecture-section" className="flex flex-col items-center justify-center h-screen w-full px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
        <div className="w-full">
          <div className="relative w-full">
            
            {/* Team Navigation Arrow - Right side centered within section */}
            <motion.button
              onClick={() => setIsTeamSlideOpen(true)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 group flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors duration-300 cursor-pointer z-10"
              aria-label="View team"
              whileHover={{ x: 5 }}
            >
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ChevronRight size={28} className="text-blue-500 group-hover:text-blue-600" />
              </motion.div>
            </motion.button>

            <div className="grid w-full grid-cols-12">
              <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
                <div className="relative flex flex-col items-center text-center">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-tight max-w-4xl text-gray-900 dark:text-gray-100 text-balance mb-6">
                    An Architecture of Trust
                  </h1>
                  <div className="mb-12">
                    <p className="text-gray-600 dark:text-gray-400 max-w-3xl text-lg">
                    Our advantage isn't a single feature, but a deeply integrated system designed for enduring&nbsp;value.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Architecture Points */}
            <div className="grid w-full grid-cols-12 max-w-6xl mx-auto">
              <div className="gap-8 md:gap-12 col-span-12 grid w-full grid-cols-1 items-stretch md:grid-cols-3 md:col-span-10 md:col-start-2">
                
                {/* Deep Patent Portfolio */}
                <div className="flex flex-col">
                  <svg className="md:w-12 md:h-12 h-8 w-8" width="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(-6.5, 0)">
                      <path d="M10.6667 32C10.6667 24.1033 14.9567 17.21 21.33 13.5233C23.18 12.45 25.21 11.65 27.36 11.1733M15.4701 45.4901C17.1001 47.4834 19.0867 49.1801 21.3301 50.4767C24.4667 52.2934 28.1134 53.3334 32.0001 53.3334C35.8867 53.3334 39.5334 52.2934 42.6701 50.4767M51.7859 39.9833C52.7859 37.5199 53.3326 34.8233 53.3326 31.9999C53.3326 24.1033 49.0426 17.2099 42.6693 13.5233M36.6667 10.6667C36.6667 13.244 34.5773 15.3333 32 15.3333C29.4227 15.3333 27.3333 13.244 27.3333 10.6667C27.3333 8.08934 29.4227 6 32 6C34.5773 6 36.6667 8.08934 36.6667 10.6667ZM54.6667 44.2967C54.6667 46.874 52.5773 48.9634 50 48.9634C47.4227 48.9634 45.3333 46.874 45.3333 44.2967C45.3333 41.7194 47.4227 39.63 50 39.63C52.5773 39.63 54.6667 41.7194 54.6667 44.2967ZM17.0365 42C17.0365 44.5773 14.9471 46.6667 12.3698 46.6667C9.79246 46.6667 7.70312 44.5773 7.70312 42C7.70312 39.4227 9.79246 37.3333 12.3698 37.3333C14.9471 37.3333 17.0365 39.4227 17.0365 42ZM42.6667 32C42.6667 37.891 37.891 42.6667 32 42.6667C26.109 42.6667 21.3333 37.891 21.3333 32C21.3333 26.109 26.109 21.3333 32 21.3333C37.891 21.3333 42.6667 26.109 42.6667 32Z" stroke="currentColor" strokeWidth="2"/>
                    </g>
                  </svg>
                  <div className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mt-2">Deep Patent Portfolio</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1">Fundamental patents cover our core protocol, data structures, and agent behavior, creating a defensible technological foundation.</div>
                </div>

                {/* Composable Protocol Stack */}
                <div className="flex flex-col">
                  <svg className="md:w-12 md:h-12 h-8 w-8" width="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(-2, 0)">
                      <path d="M39 37.2633C39 37.8156 39.4477 38.2633 40 38.2633C40.5523 38.2633 41 37.8156 41 37.2633H39ZM52.3333 37.2633C52.3333 37.8156 52.781 38.2633 53.3333 38.2633C53.8856 38.2633 54.3333 37.8156 54.3333 37.2633H52.3333ZM33.3333 50.3333H34.3333V48.3333H33.3333V50.3333ZM4 42.6667V41.6667C3.44772 41.6667 3 42.1144 3 42.6667H4ZM34.6667 43.6667H35.6667V41.6667H34.6667V43.6667ZM33.3333 43.6667H34.3333V41.6667H33.3333V43.6667ZM9.33333 42.6667H8.33333C8.33333 43.2189 8.78105 43.6667 9.33333 43.6667V42.6667ZM53.6667 24V25H55.6667V24H53.6667ZM25 43V42C24.4477 42 24 42.4477 24 43H25ZM34.6562 43H35.6562C35.6562 42.4477 35.2085 42 34.6562 42V43ZM34.6562 46V47C35.2085 47 35.6562 46.5523 35.6562 46H34.6562ZM25 46H24C24 46.5523 24.4477 47 25 47V46ZM37.3337 38.3333H56.0003V36.3333H37.3337V38.3333ZM56.0003 38.3333C56.9208 38.3333 57.667 39.0795 57.667 40H59.667C59.667 37.975 58.0254 36.3333 56.0003 36.3333V38.3333ZM57.667 40V54.6667H59.667V40H57.667ZM57.667 54.6667C57.667 55.5872 56.9208 56.3333 56.0003 56.3333V58.3333C58.0254 58.3333 59.667 56.6917 59.667 54.6667H57.667ZM56.0003 56.3333H37.3337V58.3333H56.0003V56.3333ZM37.3337 56.3333C36.4132 56.3333 35.667 55.5872 35.667 54.6667H33.667C33.667 56.6917 35.3086 58.3333 37.3337 58.3333V56.3333ZM35.667 54.6667V40H33.667V54.6667H35.667ZM35.667 40C35.667 39.0795 36.4132 38.3333 37.3337 38.3333V36.3333C35.3086 36.3333 33.667 37.975 33.667 40H35.667ZM41 37.2633V34.5967H39V37.2633H41ZM41 34.5967C41 31.4656 43.5356 28.93 46.6667 28.93V26.93C42.4311 26.93 39 30.361 39 34.5967H41ZM46.6667 28.93C49.7977 28.93 52.3333 31.4656 52.3333 34.5967H54.3333C54.3333 30.3611 50.9023 26.93 46.6667 26.93V28.93ZM52.3333 34.5967V37.2633H54.3333V34.5967H52.3333ZM33.3333 48.3333H6.66667V50.3333H33.3333V48.3333ZM6.66667 48.3333C5.9426 48.3333 5 47.5078 5 46H3C3 48.1722 4.44407 50.3333 6.66667 50.3333V48.3333ZM5 46V42.6667H3V46H5ZM4 43.6667H34.6667V41.6667H4V43.6667ZM33.3333 41.6667H9.33333V43.6667H33.3333V41.6667ZM10.3333 42.6667V9.33332H8.33333V42.6667H10.3333ZM10.3333 9.33332C10.3333 8.41227 11.079 7.66666 12 7.66666V5.66666C9.97438 5.66666 8.33333 7.30771 8.33333 9.33332H10.3333ZM12 7.66666H52V5.66666H12V7.66666ZM52 7.66666C52.921 7.66666 53.6667 8.41228 53.6667 9.33332H55.6667C55.6667 7.3077 54.0256 5.66666 52 5.66666V7.66666ZM53.6667 9.33332V24H55.6667V9.33332H53.6667ZM45.667 49V52H47.667V49H45.667ZM48.3333 46.6666C48.3333 47.5871 47.5871 48.3333 46.6667 48.3333V50.3333C48.6917 50.3333 50.3333 48.6917 50.3333 46.6666H48.3333ZM46.6667 48.3333C45.7462 48.3333 45 47.5871 45 46.6666H43C43 48.6917 44.6416 50.3333 46.6667 50.3333V48.3333ZM45 46.6666C45 45.7462 45.7462 45 46.6667 45V43C44.6416 43 43 44.6416 43 46.6666H45ZM46.6667 45C47.5871 45 48.3333 45.7462 48.3333 46.6666H50.3333C50.3333 44.6416 48.6917 43 46.6667 43V45ZM25 44H34.6562V42H25V44ZM33.6562 43V46H35.6562V43H33.6562ZM34.6562 45H25V47H34.6562V45ZM26 46V43H24V46H26Z" fill="currentColor"/>
                    </g>
                  </svg>
                  <div className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mt-2">Composable Protocol Stack</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1">Fundamental patents cover our core protocol, data structures, and agent behavior, creating a defensible technological foundation.</div>
                </div>

                {/* Generational Team */}
                <div className="flex flex-col relative">
                  <svg className="md:w-12 md:h-12 h-8 w-8" width="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(-10.5, 0)">
                      <path d="M44.0002 46.6666V44.7633C44.0002 43.59 44.5202 42.4766 45.4135 41.7133C49.8502 37.9233 52.6669 32.29 52.6669 26C52.6669 14.4766 43.2369 5.15664 31.6735 5.33664C20.6969 5.50664 11.6702 14.3933 11.3435 25.37C11.1469 31.9166 14.0002 37.7966 18.5835 41.7133C19.4769 42.4766 20.0002 43.5866 20.0002 44.7633V46.6666M32.0002 27.3834V36.0001M32.0002 27.3834L25.3335 21.3334M32.0002 27.3834L38.6668 21.3334M24.0002 53.3334H40.0002V54.6668C40.0002 56.8759 38.2093 58.6668 36.0002 58.6668H28.0002C25.791 58.6668 24.0002 56.8759 24.0002 54.6668V53.3334ZM20.0002 45.3334H44.0002V52.3334C44.0002 52.8857 43.5524 53.3334 43.0002 53.3334H21.0002C20.4479 53.3334 20.0002 52.8857 20.0002 52.3334V45.3334Z" stroke="currentColor" strokeWidth="2"/>
                    </g>
                  </svg>
                  <div className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mt-2">Generational Team</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1">Our founding and advisory team has a track record of over $10B in exits across infrastructure, AI, security, and global marketplaces.
                  </div>
                  

                </div>

              </div>
            </div>

            {/* Partner/Technology Logos */}
            <div className="mt-24 mb-8 pt-8">
              <LogoCarousel
                className="w-full"
                speed={4}
                logos={[
                  {
                    name: "AWS",
                    src: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
                    className: "h-8"
                  },
                  {
                    name: "Google Cloud",
                    src: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
                    className: "h-8"
                  },
                  {
                    name: "Microsoft Azure",
                    src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg",
                    className: "h-8"
                  },
                  {
                    name: "OpenAI",
                    src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
                    className: "h-8"
                  },
                  {
                    name: "Anthropic",
                    src: "https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg",
                    className: "h-8"
                  },
                  {
                    name: "Stripe",
                    src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
                    className: "h-6"
                  },
                  {
                    name: "GitHub",
                    src: "https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg",
                    className: "h-8"
                  },
                  {
                    name: "Docker",
                    src: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg",
                    className: "h-6"
                  },
                  {
                    name: "Kubernetes",
                    src: "https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg",
                    className: "h-8"
                  },
                  {
                    name: "MongoDB",
                    src: "https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg",
                    className: "h-8"
                  },
                  {
                    name: "PostgreSQL",
                    src: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg",
                    className: "h-8"
                  },
                  {
                    name: "Redis",
                    src: "https://upload.wikimedia.org/wikipedia/commons/6/64/Logo-redis.svg",
                    className: "h-6"
                  },
                  {
                    name: "Terraform",
                    src: "https://upload.wikimedia.org/wikipedia/commons/0/04/Terraform_Logo.svg",
                    className: "h-8"
                  },
                  {
                    name: "Cloudflare",
                    src: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg",
                    className: "h-6"
                  },
                  {
                    name: "Supabase",
                    src: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Supabase_Logo.svg",
                    className: "h-8"
                  }
                ]}
              />
            </div>
          </div>
        </div>
        </div>
      </section>

            {/* CTA Section + Footer Combined - Full Viewport */}
      <section id="cta-section" className="flex flex-col items-center justify-center h-screen w-full px-4 py-8">
        {/* CTA Content */}
        <div className="w-full max-w-6xl mx-auto flex-1 flex items-center justify-center">
          <div className="w-full">
            <div className="bg-gray-50 dark:bg-gray-900 py-16 grid grid-cols-12 rounded-lg">
              <div className="px-4 md:px-0 md:col-span-10 md:col-start-2 col-span-12 flex flex-col text-center">
                <h2 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-tight text-gray-900 dark:text-gray-100 mb-6">
                  The Internet Needs a New Trust Layer. You Can Use It Right Now.
                </h2>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto leading-relaxed">
                  Not a pitch. Not a prototype. It's infrastructure. And it's live.
                </p>
                <div className="flex flex-col items-center justify-center">
                  <Button 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs h-9 has-[>svg]:px-3 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-3 rounded-full transition duration-200"
                  >
                    Launch the Trust Layer
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-600 mt-4">
                    Start verifying in seconds. No noise. No gimmicks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Bottom of CTA Section */}
        <footer className="w-full border-t border-gray-200 dark:border-gray-700 py-8 mt-auto">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="relative">
            
            {/* Mobile Layout - Stacked */}
            <div className="flex flex-col items-center gap-6 md:hidden">
              {/* Logo */}
              <div className="flex items-center justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center"
                >
                  <motion.svg
                    className="w-8 h-8"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <rect width="50" height="50" rx="15" fill="#006DED"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M23.7366 6.15368C23.9778 6.05228 24.2376 6 24.5 6C24.7624 6 25.0222 6.05228 25.2634 6.15368L37.6518 11.3612C38.3489 11.6542 38.9431 12.1415 39.3605 12.7626C39.7779 13.3836 40.0003 14.1112 40 14.855V27.888C39.9998 30.2322 39.3676 32.5348 38.1675 34.5623C36.9675 36.5898 35.2422 38.2703 33.1664 39.4334L25.461 43.7498C25.1683 43.9138 24.8371 44 24.5 44C24.1629 44 23.8317 43.9138 23.539 43.7498L15.8336 39.4334C13.7573 38.27 12.0316 36.5889 10.8315 34.5607C9.6314 32.5324 8.99955 30.2291 9 27.8842V14.855C9.00008 14.1115 9.22261 13.3844 9.64002 12.7637C10.0574 12.143 10.6514 11.656 11.3482 11.3631L23.7366 6.15368ZM31.6823 22.5437C32.0352 22.1854 32.2305 21.7055 32.2261 21.2073C32.2217 20.7092 32.0179 20.2327 31.6587 19.8804C31.2995 19.5282 30.8135 19.3284 30.3055 19.3241C29.7975 19.3197 29.3081 19.5112 28.9427 19.8573L22.5625 26.1135L20.0573 23.657C19.6919 23.3109 19.2025 23.1194 18.6945 23.1238C18.1865 23.1281 17.7005 23.3279 17.3413 23.6802C16.9821 24.0324 16.7783 24.5089 16.7739 25.007C16.7695 25.5052 16.9648 25.9851 17.3177 26.3434L21.1927 30.1431C21.556 30.4993 22.0487 30.6994 22.5625 30.6994C23.0763 30.6994 23.569 30.4993 23.9323 30.1431L31.6823 22.5437Z" fill="white"/>
                  </motion.svg>
                </Link>
              </div>

              {/* Verifications - Centered */}
              <div className="flex items-center justify-center text-center">
                <div className="text-green-600 dark:text-green-400">
                  <CountingNumber target={2406348} /> Verifications Processed
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <a href="mailto:andrew@inverus.tech" className="hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                  Investors
                </a>
                <span>·</span>
                <a href="/manifesto" className="hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                  The Manifesto
                </a>
              </div>
            </div>

            {/* Desktop Layout - Absolute Positioning for Perfect Centering */}
            <div className="hidden md:block">
              {/* Left Logo */}
              <div className="absolute left-0 top-0">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center"
                >
                  <motion.svg
                    className="w-8 h-8"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <rect width="50" height="50" rx="15" fill="#006DED"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M23.7366 6.15368C23.9778 6.05228 24.2376 6 24.5 6C24.7624 6 25.0222 6.05228 25.2634 6.15368L37.6518 11.3612C38.3489 11.6542 38.9431 12.1415 39.3605 12.7626C39.7779 13.3836 40.0003 14.1112 40 14.855V27.888C39.9998 30.2322 39.3676 32.5348 38.1675 34.5623C36.9675 36.5898 35.2422 38.2703 33.1664 39.4334L25.461 43.7498C25.1683 43.9138 24.8371 44 24.5 44C24.1629 44 23.8317 43.9138 23.539 43.7498L15.8336 39.4334C13.7573 38.27 12.0316 36.5889 10.8315 34.5607C9.6314 32.5324 8.99955 30.2291 9 27.8842V14.855C9.00008 14.1115 9.22261 13.3844 9.64002 12.7637C10.0574 12.143 10.6514 11.656 11.3482 11.3631L23.7366 6.15368ZM31.6823 22.5437C32.0352 22.1854 32.2305 21.7055 32.2261 21.2073C32.2217 20.7092 32.0179 20.2327 31.6587 19.8804C31.2995 19.5282 30.8135 19.3284 30.3055 19.3241C29.7975 19.3197 29.3081 19.5112 28.9427 19.8573L22.5625 26.1135L20.0573 23.657C19.6919 23.3109 19.2025 23.1194 18.6945 23.1238C18.1865 23.1281 17.7005 23.3279 17.3413 23.6802C16.9821 24.0324 16.7783 24.5089 16.7739 25.007C16.7695 25.5052 16.9648 25.9851 17.3177 26.3434L21.1927 30.1431C21.556 30.4993 22.0487 30.6994 22.5625 30.6994C23.0763 30.6994 23.569 30.4993 23.9323 30.1431L31.6823 22.5437Z" fill="white"/>
                  </motion.svg>
                </Link>
              </div>

              {/* Center Verifications - Perfectly Centered */}
              <div className="flex items-center justify-center text-center">
                <div className="text-green-600 dark:text-green-400">
                  <CountingNumber target={2406348} /> Verifications Processed
                </div>
              </div>

              {/* Right Links */}
              <div className="absolute right-0 top-0">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <a href="mailto:andrew@inverus.tech" className="hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    Investors
                  </a>
                  <span>·</span>
                  <a href="/manifesto" className="hover:text-gray-900 dark:hover:text-gray-100 transition duration-200">
                    The Manifesto
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
        </footer>
      </section>

      {/* Global Fixed Scroll Arrow - Works on all sections */}
      <AnimatePresence>
        {showScrollArrow && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <motion.button
              onClick={handleArrowClick}
              className="group flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ChevronDown size={28} className="text-blue-500 group-hover:text-blue-600" />
              </motion.div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>



      {/* Team Slide */}
      <TeamSlide
        isOpen={isTeamSlideOpen}
        onClose={() => {
          setIsTeamSlideOpen(false)
          // Scroll back to architecture section
          setTimeout(() => {
            document.getElementById('architecture-section')?.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
          }, 500)
        }}
      />

    </div>
  )
} 