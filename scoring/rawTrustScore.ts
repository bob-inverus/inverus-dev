/**
 * Raw Trust Score (TSRaw) module
 *
 * TSRaw = (WIVH × ScoreIVH) +
 *         (WABD × ScoreABD) +
 *         (WDIT × ScoreDIT) +
 *         (WRIE × ScoreRIE) +
 *         (WIVSD × ScoreIVSD) +
 *         (WRep × ScoreRep) +
 *         (WBeh × ScoreBeh)
 */

export interface RawTrustInputs {
  /** Identity Verification History & Consistency */
  ScoreIVH: number
  /** Attribute Verification Depth & Breadth */
  ScoreABD: number
  /** Digital Identity Tenure & Activity */
  ScoreDIT: number
  /** Recent Identity Events & Changes */
  ScoreRIE: number
  /** Identity Verification Source Diversity */
  ScoreIVSD: number
  /** Consortium Reputation Score */
  ScoreRep: number
  /** Behavioral and Transactional Trust Signals */
  ScoreBeh: number
}

export interface RawTrustWeights {
  WIVH: number // ~35%
  WABD: number // ~30%
  WDIT: number // ~15%
  WRIE: number // ~10%
  WIVSD: number // ~10%
  WRep: number // ~10–20%
  WBeh: number // ~10–20%
}

export interface RawTrustComponentBreakdown {
  name: keyof RawTrustInputs
  weightName: keyof RawTrustWeights
  weight: number
  score: number
  weightedScore: number
}

export interface RawTrustResult {
  total: number
  breakdown: RawTrustComponentBreakdown[]
}

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

function normalizeWeights(weights: RawTrustWeights): RawTrustWeights {
  const sum =
    weights.WIVH +
    weights.WABD +
    weights.WDIT +
    weights.WRIE +
    weights.WIVSD +
    weights.WRep +
    weights.WBeh

  if (sum === 0) {
    return {
      WIVH: 0.35,
      WABD: 0.3,
      WDIT: 0.15,
      WRIE: 0.1,
      WIVSD: 0.1,
      WRep: 0.1,
      WBeh: 0.1,
    }
  }

  return {
    WIVH: weights.WIVH / sum,
    WABD: weights.WABD / sum,
    WDIT: weights.WDIT / sum,
    WRIE: weights.WRIE / sum,
    WIVSD: weights.WIVSD / sum,
    WRep: weights.WRep / sum,
    WBeh: weights.WBeh / sum,
  }
}

/**
 * Compute TSRaw from component scores and weights.
 */
export function computeRawTrustScore(
  inputs: RawTrustInputs,
  weights: RawTrustWeights
): RawTrustResult {
  const w = normalizeWeights(weights)

  const pairs: Array<{
    name: keyof RawTrustInputs
    weightName: keyof RawTrustWeights
  }> = [
    { name: "ScoreIVH", weightName: "WIVH" },
    { name: "ScoreABD", weightName: "WABD" },
    { name: "ScoreDIT", weightName: "WDIT" },
    { name: "ScoreRIE", weightName: "WRIE" },
    { name: "ScoreIVSD", weightName: "WIVSD" },
    { name: "ScoreRep", weightName: "WRep" },
    { name: "ScoreBeh", weightName: "WBeh" },
  ]

  const breakdown: RawTrustComponentBreakdown[] = pairs.map(({ name, weightName }) => {
    const score = clampScore(inputs[name])
    const weight = w[weightName]
    const weightedScore = weight * score
    return { name, weightName, weight, score, weightedScore }
  })

  const total = breakdown.reduce((sum, b) => sum + b.weightedScore, 0)

  return { total, breakdown }
} 