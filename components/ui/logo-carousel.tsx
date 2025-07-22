"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface LogoCarouselProps {
  logos: {
    name: string
    src: string
    className?: string
  }[]
  className?: string
  speed?: number
  columns?: number
}

export function LogoCarousel({ logos, className, speed = 4, columns = 5 }: LogoCarouselProps) {
  // Create column groups from logos
  const getLogosForColumn = (columnIndex: number) => {
    const logosPerColumn = Math.ceil(logos.length / columns)
    const columnLogos = []
    
    for (let i = 0; i < logosPerColumn; i++) {
      const logoIndex = (columnIndex + i * columns) % logos.length
      if (logoIndex < logos.length) {
        columnLogos.push({ ...logos[logoIndex], originalIndex: logoIndex })
      }
    }
    
    return columnLogos
  }

  // Single state that controls all columns simultaneously
  const [globalLogoIndex, setGlobalLogoIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalLogoIndex(prev => {
        // Find the maximum number of logos per column to determine cycling
        const maxLogosPerColumn = Math.max(
          ...Array(columns).fill(0).map((_, colIndex) => getLogosForColumn(colIndex).length)
        )
        return (prev + 1) % maxLogosPerColumn
      })
    }, speed * 1000)

    return () => clearInterval(interval)
  }, [logos.length, speed, columns])

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <div className="grid grid-cols-5 gap-x-8 place-items-center">
        {Array(columns).fill(null).map((_, columnIndex) => {
          const columnLogos = getLogosForColumn(columnIndex)
          const currentLogoIndex = globalLogoIndex % columnLogos.length
          
          return (
            <div key={columnIndex} className="relative flex w-full flex-col items-center justify-center aspect-[3/1]">
              {columnLogos.map((logo, logoIndex) => {
                const isVisible = logoIndex === currentLogoIndex
                const position = logoIndex - currentLogoIndex
                
                let transform = "translate-y-0"
                let opacity = 1
                
                if (position > 0) {
                  transform = "translate-y-[2.5rem]"
                  opacity = 0
                } else if (position < 0) {
                  transform = "-translate-y-[2.5rem]"
                  opacity = 0
                }

                return (
                  <div key={logo.originalIndex} aria-hidden={!isVisible} aria-label={logo.name} className="aspect-[3/1] absolute left-0 top-0 w-full h-full">
                    <motion.div
                      className="absolute left-0 top-0 flex h-full w-full items-center justify-center"
                      initial={{ y: position > 0 ? 40 : position < 0 ? -40 : 0, opacity: isVisible ? 1 : 0 }}
                      animate={{ 
                        y: position > 0 ? 40 : position < 0 ? -40 : 0, 
                        opacity: isVisible ? 1 : 0 
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <div className="aspect-1/1 relative w-full max-w-[10rem]">
                        <img
                          src={logo.src}
                          alt={logo.name}
                          className={cn(
                            "absolute left-0 top-0 h-full w-full object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300",
                            logo.className
                          )}
                        />
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
} 