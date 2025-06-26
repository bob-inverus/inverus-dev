"use client"

import { motion } from "motion/react"
import { useMemo } from "react"
import { SUGGESTIONS as SUGGESTIONS_CONFIG } from "../../../lib/config"

type QueryProgressBarProps = {
  value: string
}

export function QueryProgressBar({ value }: QueryProgressBarProps) {
  // Calculate how many suggestions are currently active
  const progressPercentage = useMemo(() => {
    if (!value || value.trim() === "") {
      return 0
    }

    const currentValue = value.toLowerCase()
    let activeCount = 0
    
    SUGGESTIONS_CONFIG.forEach(config => {
      if (currentValue.includes(config.prompt.toLowerCase())) {
        activeCount++
      }
    })
    
    // Calculate percentage (0-100)
    const percentage = (activeCount / SUGGESTIONS_CONFIG.length) * 100
    return Math.min(percentage, 100)
  }, [value])

  // Don't show the progress bar if no suggestions are active
  if (progressPercentage === 0) {
    return null
  }

  return (
    <div className="px-4 pb-2">
      <div className="relative w-full h-1 bg-border/20 overflow-hidden rounded-full">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </div>
    </div>
  )
} 