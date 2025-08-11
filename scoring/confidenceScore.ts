/**
 * Confidence Score (CS) module
 *
 * CS = (WDQ × ScoreDQ) + (WST × ScoreST)
 */

export interface ConfidenceWeights {
  /** Weight for Data Quality (~60%) */
  WDQ: number
  /** Weight for Source Trustworthiness (~40%) */
  WST: number
}

export interface ConfidenceInputs {
  ScoreDQ: number
  ScoreST: number
}

export interface ConfidenceComponentBreakdown {
  name: keyof ConfidenceInputs
  weightName: keyof ConfidenceWeights
  weight: number
  score: number
  weightedScore: number
}

export interface ConfidenceResult {
  total: number
  breakdown: ConfidenceComponentBreakdown[]
}

function normalizeWeights(weights: ConfidenceWeights): ConfidenceWeights {
  const sum = weights.WDQ + weights.WST
  if (sum === 0) return { WDQ: 0.6, WST: 0.4 }
  return { WDQ: weights.WDQ / sum, WST: weights.WST / sum }
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

/**
 * Compute Confidence Score (CS)
 */
export function computeConfidenceScore(
  inputs: ConfidenceInputs,
  weights: ConfidenceWeights
): ConfidenceResult {
  const w = normalizeWeights(weights)
  const pairs: Array<{ name: keyof ConfidenceInputs; weightName: keyof ConfidenceWeights }> = [
    { name: "ScoreDQ", weightName: "WDQ" },
    { name: "ScoreST", weightName: "WST" },
  ]

  const breakdown: ConfidenceComponentBreakdown[] = pairs.map(({ name, weightName }) => {
    const score = clampScore(inputs[name])
    const weight = w[weightName]
    const weightedScore = weight * score
    return { name, weightName, weight, score, weightedScore }
  })

  const total = breakdown.reduce((sum, b) => sum + b.weightedScore, 0)
  return { total, breakdown }
} 