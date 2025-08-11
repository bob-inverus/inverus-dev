/**
 * Consortium Reputation scoring module
 *
 * Implements: ScoreRep = Σ_i [ SCWi × (DYKi × WDYK + WDBi × WWDB) × FRDi × FVC ] × CF
 */

export interface ReputationFeedbackInput {
  /** Source Credibility Weight (0–1) */
  SCWi: number
  /** Do You Know? (1 or 0) */
  DYKi: 0 | 1
  /** Would You Do Business? (1 or 0) */
  WDBi: 0 | 1
  /** Feedback Recency Decay (e.g., e^(−λ × days_old)) in [0,1] */
  FRDi: number
  /** Feedback Volume Confidence (e.g., N / (N + k)) in [0,1] */
  FVC: number
}

export interface ReputationWeights {
  /** Weight for DYKi */
  WDYK: number
  /** Weight for WDBi */
  WWDB: number
  /** Consensus Factor multiplier */
  CF: number
}

export interface ReputationTermBreakdown {
  index: number
  SCWi: number
  DYKi: 0 | 1
  WDBi: 0 | 1
  FRDi: number
  FVC: number
  inner: number
  weighted: number
}

export interface ReputationResult {
  total: number
  CF: number
  terms: ReputationTermBreakdown[]
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/**
 * Compute Consortium Reputation Score (ScoreRep)
 * @param feedback - Array of feedback terms from consortium members
 * @param weights - Weights and consensus factor
 */
export function computeConsortiumReputation(
  feedback: ReputationFeedbackInput[],
  weights: ReputationWeights
): ReputationResult {
  const terms: ReputationTermBreakdown[] = feedback.map((f, i) => {
    const SCWi = clamp01(f.SCWi)
    const DYKi = f.DYKi
    const WDBi = f.WDBi
    const FRDi = clamp01(f.FRDi)
    const FVC = clamp01(f.FVC)

    const inner = DYKi * weights.WDYK + WDBi * weights.WWDB
    const weighted = SCWi * inner * FRDi * FVC

    return { index: i, SCWi, DYKi, WDBi, FRDi, FVC, inner, weighted }
  })

  const sum = terms.reduce((acc, t) => acc + t.weighted, 0)
  const total = sum * weights.CF

  return { total, CF: weights.CF, terms }
} 