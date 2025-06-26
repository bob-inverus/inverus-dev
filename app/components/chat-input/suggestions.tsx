"use client"

import { PromptSuggestion } from "@/components/prompt-kit/prompt-suggestion"
import { TRANSITION_SUGGESTIONS } from "@/lib/motion"
import { motion } from "motion/react"
import React, { memo, useCallback, useMemo, useState, useEffect } from "react"
import { SUGGESTIONS as SUGGESTIONS_CONFIG } from "../../../lib/config"

type SuggestionsProps = {
  onValueChange: (value: string) => void
  onSuggestion: (suggestion: string) => void
  value?: string
}

const MotionPromptSuggestion = motion.create(PromptSuggestion)

export const Suggestions = memo(function Suggestions({
  onValueChange,
  onSuggestion,
  value,
}: SuggestionsProps) {
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())

  // Reset selections when input is cleared or field prompts are removed
  useEffect(() => {
    if (!value || value.trim() === "") {
      setSelectedFields(new Set())
      return
    }

    // Check which fields are actually present in the input
    const currentValue = value.toLowerCase()
    const activeFields = new Set<string>()
    
    SUGGESTIONS_CONFIG.forEach(config => {
      if (currentValue.includes(config.prompt.toLowerCase())) {
        activeFields.add(config.label)
      }
    })
    
    setSelectedFields(activeFields)
  }, [value])

  const handleCategoryClick = useCallback(
    (suggestion: { label: string; prompt: string }) => {
      const currentValue = value || ""
      
      // Check if this prompt already exists in the current value
      if (currentValue.toLowerCase().includes(suggestion.prompt.toLowerCase())) {
        // If it already exists, remove it (toggle off)
        const regex = new RegExp(`\\s*${suggestion.prompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'gi')
        const newValue = currentValue.replace(regex, ' ').replace(/\s+/g, ' ').trim()
        onValueChange(newValue)
        return
      }
      
      // For search fields, append to existing value (toggle on)
      const separator = currentValue.trim() ? " " : ""
      const newValue = currentValue + separator + suggestion.prompt + " "
      onValueChange(newValue)
    },
    [onValueChange, value]
  )

  const suggestionsGrid = useMemo(
    () => (
      <motion.div
        key="suggestions-grid"
        className="flex w-full max-w-full flex-nowrap justify-start gap-2 overflow-x-auto px-2 md:mx-auto md:max-w-2xl md:flex-wrap md:justify-center md:pl-0"
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0, y: 10, filter: "blur(4px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        }}
        transition={TRANSITION_SUGGESTIONS}
        style={{
          scrollbarWidth: "none",
        }}
      >
        {SUGGESTIONS_CONFIG.map((suggestion, index) => {
          const isSelected = selectedFields.has(suggestion.label)
          return (
            <MotionPromptSuggestion
              key={suggestion.label}
              onClick={() => handleCategoryClick(suggestion)}
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-10 px-6 has-[>svg]:px-4 rounded-full capitalize ${
                isSelected 
                  ? "bg-accent/80 text-accent-foreground border-accent hover:bg-accent" 
                  : ""
              }`}
              initial="initial"
              animate="animate"
              transition={{
                ...TRANSITION_SUGGESTIONS,
                delay: index * 0.02,
              }}
              variants={{
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1 },
              }}
            >
              <suggestion.icon className="size-4" />
              {suggestion.label}
            </MotionPromptSuggestion>
          )
        })}
      </motion.div>
    ),
    [handleCategoryClick, selectedFields]
  )

  return suggestionsGrid
})
