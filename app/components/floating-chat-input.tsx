"use client"

import { useState } from "react"
import { ArrowUp } from "lucide-react"

interface FloatingChatInputProps {
  placeholder?: string
  onSubmit?: (message: string) => void
}

export function FloatingChatInput({ 
  placeholder = "Ask ChatGPT", 
  onSubmit 
}: FloatingChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && onSubmit) {
      onSubmit(message.trim())
      setMessage("")
    }
  }

  return (
    <div className="@container sticky bottom-4 left-0 right-0 z-50 mx-auto h-[48px] w-[200px] transition-all duration-500 ease-out focus-within:w-[355px] hover:scale-105 focus-within:hover:scale-100 translate-y-0 opacity-100">
      <form className="relative" onSubmit={handleSubmit}>
        <label className="relative flex w-full rounded-[24px] p-2 shadow-sm backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50">
          <input 
            className="placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md:text-base h-8 pr-12 mx-3 w-full bg-transparent focus:outline-none text-gray-900 dark:text-gray-100" 
            placeholder={placeholder}
            aria-label="Message input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button 
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:text-gray-300 dark:disabled:text-gray-400 absolute right-2 top-2 h-8 w-8 flex-none rounded-full p-0 hover:opacity-70 disabled:hover:opacity-100 flex items-center justify-center transition-opacity" 
            type="submit" 
            aria-label="Send message"
            disabled={!message.trim()}
          >
            <ArrowUp size={16} strokeWidth={2} />
          </button>
        </label>
      </form>
    </div>
  )
} 