"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import React, { useEffect, useState, Children } from "react"

type TextLoopProps = {
  children: React.ReactNode[]
  className?: string
  interval?: number // seconds
  transition?: any
  variants?: Record<string, any>
  onIndexChange?: (index: number) => void
}

export function TextLoop({
  children,
  className,
  interval = 2,
  transition = { duration: 0.25, ease: "easeInOut" },
  variants,
  onIndexChange,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const items = Children.toArray(children)

  useEffect(() => {
    const intervalMs = interval * 1000
    const timer = setInterval(() => {
      setCurrentIndex(current => {
        const next = (current + 1) % items.length
        onIndexChange?.(next)
        return next
      })
    }, intervalMs)
    return () => clearInterval(timer)
  }, [items.length, interval, onIndexChange])

  const defaultVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <div className={cn("relative inline-block whitespace-nowrap overflow-hidden", className)}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          variants={variants || defaultVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
} 