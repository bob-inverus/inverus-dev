"use client"

import { useEffect, useState } from "react"

export interface CircularChartProps {
  score: number
  title: string
  size?: number
  maskedValue?: string
}

export function CircularChart({ score, title, size = 120, maskedValue }: CircularChartProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedOffset, setAnimatedOffset] = useState(0)

  const radius = 45
  const strokeWidth = 6
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`

  const getStrokeColor = (title: string) => {
    if (title === "Trust Score") return "#3b82f6"
    if (title === "Confidence Score") return "#6b7280"
    return "#6b7280"
  }

  useEffect(() => {
    const startDelay = setTimeout(() => {
      const duration = 1000
      const steps = 60
      const stepDuration = duration / steps
      const offsetStart = circumference
      const offsetEnd = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference
      const offsetDecrement = (offsetStart - offsetEnd) / steps

      let currentStep = 0
      const animate = () => {
        if (currentStep <= steps) {
          const progress = currentStep / steps
          const easeOutCubic = 1 - Math.pow(1 - progress, 3)
          const newScore = Math.round(Math.max(0, Math.min(100, score)) * easeOutCubic)
          const newOffset = offsetStart - offsetDecrement * steps * easeOutCubic
          setAnimatedScore(newScore)
          setAnimatedOffset(newOffset)
          currentStep++
          setTimeout(animate, stepDuration)
        }
      }
      animate()
    }, 100)

    return () => clearTimeout(startDelay)
  }, [score, circumference])

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg height={size} width={size} className="-rotate-90 transform">
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
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
            className="transition-none"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {maskedValue ? (
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{maskedValue}</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{animatedScore}</span>
              <span className="ml-0.5 text-sm font-medium text-gray-500">%</span>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 text-center">
        <div className="font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      </div>
    </div>
  )
} 