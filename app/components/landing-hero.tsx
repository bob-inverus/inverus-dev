"use client"

import { useState, useEffect } from "react"
import { InverusIcon } from "@/components/icons/inverus"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"

interface DemoMessage {
  id: string
  content: string
  type: 'loading' | 'result'
  isTyping?: boolean
}

interface DemoResult {
  name: string
  trustScore: number
  confidenceScore: number
}

export function LandingHero() {
  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([])
  const [showCTA, setShowCTA] = useState(false)
  const [hasRunDemo, setHasRunDemo] = useState(false)

  const runDemo = () => {
    if (hasRunDemo) return
    
    setDemoMessages([])
    setShowCTA(false)
    
    const messages = [
      { id: '1', content: 'Accessing Trust Layer...', type: 'loading' as const },
      { id: '2', content: 'Cross-referencing signals...', type: 'loading' as const },
      { id: '3', content: 'Calculating score...', type: 'loading' as const },
    ]
    
    // Add messages with delays
    messages.forEach((message, index) => {
      setTimeout(() => {
        setDemoMessages(prev => [...prev, { ...message, isTyping: true }])
        
        // Stop typing animation after a brief moment
        setTimeout(() => {
          setDemoMessages(prev => 
            prev.map(msg => 
              msg.id === message.id ? { ...msg, isTyping: false } : msg
            )
          )
        }, 800)
      }, index * 600)
    })
    
    // Show final result after 2 seconds
    setTimeout(() => {
      const result: DemoResult = {
        name: "Alexei Petrov",
        trustScore: 88,
        confidenceScore: 92
      }
      
      setDemoMessages(prev => [...prev, {
        id: '4',
        content: `${result.name} – Trust Score: ${result.trustScore}; Confidence Score: ${result.confidenceScore}`,
        type: 'result',
        isTyping: false
      }])
      
      setShowCTA(true)
      setHasRunDemo(true)
    }, 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-orange-500'
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full min-h-0 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12 max-w-4xl mx-auto">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <InverusIcon className="w-9 h-9" style={{ color: '#60A5FA' }} />
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight mb-4">
          <div>Know Who's Real.</div>
          <div>Know What's Real.</div>
        </h1>
        
        {/* Sub-headline */}
        <p className="text-lg md:text-xl font-medium text-gray-400">
          The Trust Layer for the Internet.
        </p>
      </div>
      
      {/* Interactive Demo Area */}
      <div className="w-full max-w-3xl mx-auto">
        {/* Demo Messages */}
        <AnimatePresence>
          {demoMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 space-y-4 bg-background border border-border rounded-lg p-6"
            >
              {demoMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    {message.type === 'loading' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {message.content}
                        </span>
                        {message.isTyping && (
                          <motion.div
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                            className="w-2 h-4 bg-current"
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className={`text-lg font-semibold ${getScoreColor(88)}`}>
                          {message.content}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          (Sample data for demo purposes)
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* CTA Panel - Only show once */}
              <AnimatePresence>
                {showCTA && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 border-t border-border pt-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Freemium Path */}
                      <div className="text-center md:text-left">
                        <h3 className="text-lg font-semibold mb-2">See the Truth, For Free</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Claim 5 free, real-time verifications. No credit card required.
                        </p>
                        <Button asChild className="w-full md:w-auto">
                          <Link href="/auth" target="_blank" rel="noopener noreferrer">
                            Claim Your 5 Free Verifications
                          </Link>
                        </Button>
                      </div>
                      
                      {/* Pro Path */}
                      <div className="text-center md:text-left">
                        <h3 className="text-lg font-semibold mb-2">Own the Engine</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          For professionals and developers.
                        </p>
                        <Button asChild variant="outline" className="w-full md:w-auto">
                          <Link href="/auth" target="_blank" rel="noopener noreferrer">
                            Go Pro & Get API Keys
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Demo Input */}
        <div className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Enter a name to verify (e.g., Alexei Petrov)..."
              className="w-full h-14 px-4 pr-20 text-lg border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !hasRunDemo) {
                  runDemo()
                }
              }}
            />
            <Button
              onClick={runDemo}
              disabled={hasRunDemo}
              className="absolute right-2 h-10"
            >
              Verify
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            AI can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  )
} 