/**
 * Data Quality scoring module
 *
 * Computes ScoreDQ from individual quality dimensions using weighted average.
 */

export interface DataQualityMetrics {
  completeness: number
  consistency: number
  validity: number
  accuracy: number
  timeliness: number
  uniqueness: number
  precision: number
  usability: number
}

export interface DataQualityWeights {
  completeness: number
  consistency: number
  validity: number
  accuracy: number
  timeliness: number
  uniqueness: number
  precision: number
  usability: number
}

export interface DataQualityComponentBreakdown {
  name: keyof DataQualityMetrics
  weight: number
  score: number
  weightedScore: number
}

export interface DataQualityResult {
  total: number
  breakdown: DataQualityComponentBreakdown[]
}

/** Default equal weights if none provided */
export const DEFAULT_DQ_WEIGHTS: DataQualityWeights = {
  completeness: 0.125,
  consistency: 0.125,
  validity: 0.125,
  accuracy: 0.125,
  timeliness: 0.125,
  uniqueness: 0.125,
  precision: 0.125,
  usability: 0.125,
}

/**
 * Clamp a numeric value into [0, 100].
 */
function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

/**
 * Normalize weights to sum to 1.0 to avoid accidental mis-weighting.
 */
function normalizeWeights(weights: DataQualityWeights): DataQualityWeights {
  const sum =
    weights.completeness +
    weights.consistency +
    weights.validity +
    weights.accuracy +
    weights.timeliness +
    weights.uniqueness +
    weights.precision +
    weights.usability

  if (sum === 0) {
    return DEFAULT_DQ_WEIGHTS
  }

  return {
    completeness: weights.completeness / sum,
    consistency: weights.consistency / sum,
    validity: weights.validity / sum,
    accuracy: weights.accuracy / sum,
    timeliness: weights.timeliness / sum,
    uniqueness: weights.uniqueness / sum,
    precision: weights.precision / sum,
    usability: weights.usability / sum,
  }
}

/**
 * Compute Data Quality Score (ScoreDQ)
 *
 * @param metrics - The individual data quality metrics (0–100 each)
 * @param weights - Optional weights for each metric (will be normalized)
 * @returns DataQualityResult with total score (0–100) and per-metric breakdown
 */
export function computeDataQualityScore(
  metrics: DataQualityMetrics,
  weights: DataQualityWeights = DEFAULT_DQ_WEIGHTS
): DataQualityResult {
  const w = normalizeWeights(weights)

  const entries: Array<keyof DataQualityMetrics> = [
    "completeness",
    "consistency",
    "validity",
    "accuracy",
    "timeliness",
    "uniqueness",
    "precision",
    "usability",
  ]

  const breakdown: DataQualityComponentBreakdown[] = entries.map((name) => {
    const weight = w[name]
    const score = clampScore(metrics[name])
    const weightedScore = weight * score
    return { name, weight, score, weightedScore }
  })

  const total = breakdown.reduce((sum, b) => sum + b.weightedScore, 0)

  return { total, breakdown }
} 