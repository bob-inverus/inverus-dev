/**
 * Final Digital Identity Score (DIS) module
 *
 * Option 1: Direct Modulation
 *  DIS = TSRaw × CSFactor
 *  CSFactor = CS / MaxCS
 *
 * Option 2: Hybrid Approach
 *  DIS = (1 − ConfidenceWeight) × InitialTrustEstimate + ConfidenceWeight × EmpiricalTrustScore
 *  ConfidenceWeight = CS / MaxCS
 */

export interface FinalScoreInputs {
  TSRaw: number
  CS: number
  MaxCS: number
  InitialTrustEstimate: number
  EmpiricalTrustScore: number
}

export interface FinalScoreOption1Result {
  option: "direct_modulation"
  CSFactor: number
  DIS: number
}

export interface FinalScoreOption2Result {
  option: "hybrid"
  ConfidenceWeight: number
  DIS: number
}

export interface FinalScoreResult {
  option1: FinalScoreOption1Result
  option2: FinalScoreOption2Result
}

function clampNonNegative(value: number): number {
  if (Number.isNaN(value)) return 0
  return value < 0 ? 0 : value
}

/**
 * Compute Final Digital Identity Scores using both options.
 */
export function computeFinalScores(inputs: FinalScoreInputs): FinalScoreResult {
  const MaxCS = inputs.MaxCS > 0 ? inputs.MaxCS : 100
  const CS = clampNonNegative(inputs.CS)
  const TSRaw = clampNonNegative(inputs.TSRaw)
  const InitialTrustEstimate = clampNonNegative(inputs.InitialTrustEstimate)
  const EmpiricalTrustScore = clampNonNegative(inputs.EmpiricalTrustScore)

  // Option 1
  const CSFactor = CS / MaxCS
  const DIS1 = TSRaw * CSFactor

  // Option 2
  const ConfidenceWeight = CS / MaxCS
  const DIS2 = (1 - ConfidenceWeight) * InitialTrustEstimate + ConfidenceWeight * EmpiricalTrustScore

  return {
    option1: { option: "direct_modulation", CSFactor, DIS: DIS1 },
    option2: { option: "hybrid", ConfidenceWeight, DIS: DIS2 },
  }
} 