/**
 * Source Trustworthiness scoring module
 *
 * Computes ScoreST from qualitative trust dimensions using weighted average.
 */

export interface SourceTrustworthinessMetrics {
  security: number
  privacy: number
  ethics: number
  resiliency: number
  robustness: number
  reliability: number
  reputation: number
  transparency: number
  updateFrequency: number
}

export interface SourceTrustworthinessWeights {
  security: number
  privacy: number
  ethics: number
  resiliency: number
  robustness: number
  reliability: number
  reputation: number
  transparency: number
  updateFrequency: number
}

export interface SourceTrustComponentBreakdown {
  name: keyof SourceTrustworthinessMetrics
  weight: number
  score: number
  weightedScore: number
}

export interface SourceTrustResult {
  total: number
  breakdown: SourceTrustComponentBreakdown[]
}

/** Default equal weights if none provided */
export const DEFAULT_ST_WEIGHTS: SourceTrustworthinessWeights = {
  security: 1 / 9,
  privacy: 1 / 9,
  ethics: 1 / 9,
  resiliency: 1 / 9,
  robustness: 1 / 9,
  reliability: 1 / 9,
  reputation: 1 / 9,
  transparency: 1 / 9,
  updateFrequency: 1 / 9,
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

function normalizeWeights(
  weights: SourceTrustworthinessWeights
): SourceTrustworthinessWeights {
  const sum =
    weights.security +
    weights.privacy +
    weights.ethics +
    weights.resiliency +
    weights.robustness +
    weights.reliability +
    weights.reputation +
    weights.transparency +
    weights.updateFrequency

  if (sum === 0) return DEFAULT_ST_WEIGHTS

  return {
    security: weights.security / sum,
    privacy: weights.privacy / sum,
    ethics: weights.ethics / sum,
    resiliency: weights.resiliency / sum,
    robustness: weights.robustness / sum,
    reliability: weights.reliability / sum,
    reputation: weights.reputation / sum,
    transparency: weights.transparency / sum,
    updateFrequency: weights.updateFrequency / sum,
  }
}

/**
 * Compute Source Trustworthiness Score (ScoreST)
 *
 * @param metrics - The source trustworthiness metrics (0–100 each)
 * @param weights - Optional weights (normalized internally)
 */
export function computeSourceTrustworthiness(
  metrics: SourceTrustworthinessMetrics,
  weights: SourceTrustworthinessWeights = DEFAULT_ST_WEIGHTS
): SourceTrustResult {
  const w = normalizeWeights(weights)

  const entries: Array<keyof SourceTrustworthinessMetrics> = [
    "security",
    "privacy",
    "ethics",
    "resiliency",
    "robustness",
    "reliability",
    "reputation",
    "transparency",
    "updateFrequency",
  ]

  const breakdown: SourceTrustComponentBreakdown[] = entries.map((name) => {
    const weight = w[name]
    const score = clampScore(metrics[name])
    const weightedScore = weight * score
    return { name, weight, score, weightedScore }
  })

  const total = breakdown.reduce((sum, b) => sum + b.weightedScore, 0)

  return { total, breakdown }
} 