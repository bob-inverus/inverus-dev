"use client"

import { TrendingUp } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ConfidenceScoreChartProps = {
  score: number
  className?: string
}

export function ConfidenceScoreChart({ score, className }: ConfidenceScoreChartProps) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Confidence Score</CardTitle>
        <CardDescription>Data Accuracy Level</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center relative">
          {/* Circular progress indicator */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <path
                className="text-muted/20"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              {/* Progress circle */}
              <path
                className="text-chart-2"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{score}%</span>
              <span className="text-muted-foreground text-sm">Confidence</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {score >= 80 ? "Very confident" : score >= 60 ? "Confident" : score >= 40 ? "Moderate confidence" : "Low confidence"}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Based on data quality indicators
        </div>
      </CardFooter>
    </Card>
  )
} 