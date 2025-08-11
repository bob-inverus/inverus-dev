import { NextRequest, NextResponse } from "next/server"
import { computeDataQualityScore, type DataQualityMetrics } from "@/scoring/dataQuality"
import { computeSourceTrustworthiness, type SourceTrustworthinessMetrics } from "@/scoring/sourceTrustworthiness"
import { computeConsortiumReputation, type ReputationFeedbackInput, type ReputationWeights } from "@/scoring/consortiumReputation"
import { computeRawTrustScore, type RawTrustWeights } from "@/scoring/rawTrustScore"
import { computeConfidenceScore, type ConfidenceWeights } from "@/scoring/confidenceScore"
import { computeFinalScores } from "@/scoring/finalScore"
import { deriveDataQualityMetrics, deriveSourceTrustworthinessMetrics, randomizeConfidenceWeights } from "@/lib/scoring/derive-metrics"
import { deriveRawTrustInputs } from "@/lib/scoring/derive-metrics"

/**
 * Types for the API response
 */
interface PersonRecord {
  id: string
  name: string
  email?: string
  phone?: string
  city?: string
  state?: string
}

interface ScoreBreakdown {
  raw_trust: ReturnType<typeof computeRawTrustScore>
  consortium_reputation: ReturnType<typeof computeConsortiumReputation>
  data_quality: ReturnType<typeof computeDataQualityScore>
  source_trust: ReturnType<typeof computeSourceTrustworthiness>
  confidence: ReturnType<typeof computeConfidenceScore>
  final: ReturnType<typeof computeFinalScores>
}

interface ScoredPersonResult extends PersonRecord {
  scores: {
    TSRaw: number
    CS: number
    DIS_option1: number
    DIS_option2: number
  }
  score_breakdown: ScoreBreakdown
}

interface SearchPeopleResponse {
  query: string
  count: number
  results: ScoredPersonResult[]
}

/**
 * Mock search to find matching people based on query.
 * In a real implementation, replace with DB/search service lookup.
 */
function mockSearchPeople(query: string): PersonRecord[] {
  const base: PersonRecord[] = [
    { id: "1", name: "Alice Johnson", email: "alice@example.com", city: "Boston", state: "MA" },
    { id: "2", name: "Bob Smith", email: "bob.smith@example.com", phone: "555-123-7890", city: "New York", state: "NY" },
    { id: "3", name: "Charlie Davis", email: "charlie@business.com", city: "San Francisco", state: "CA" },
  ]
  const q = query.toLowerCase()
  return base.filter((p) => Object.values(p).some((v) => String(v ?? "").toLowerCase().includes(q)))
}

/**
 * Generate mock scoring inputs per person for demo purposes.
 * Replace with real feature extraction when available.
 */
function mockScoringInputs(person: PersonRecord & Record<string, any>) {
  // Heuristic demo values derived from presence of fields
  const email = person.Email || person.email
  const phone = person["Mobile Phone"] || person.phone
  const city = person.city || person.City
  const state = person.state || person.State
  const status = person.Status || person.Result
  const isValid = person["Is Valid"] === true || String(status || "").toLowerCase() === "valid"
  const regDateRaw = person.reg_date || person.regDate || person.registered_at
  const hasEmail = Boolean(email)
  const hasPhone = Boolean(phone)
  const hasLocation = Boolean(city || state)

  // Recency decay for consortium feedback (FRD)
  const now = new Date()
  const parsed = regDateRaw ? new Date(regDateRaw) : null
  const daysOld = parsed ? Math.max(0, Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24))) : 365
  const lambda = 0.01 // decay factor
  const FRD = Math.exp(-lambda * daysOld)
  const FVC = 0.5 // volume confidence placeholder (N/(N+k))

  const ScoreIVH = isValid ? 85 : 60 // history/consistency from valid status
  const ScoreABD = (hasEmail ? 15 : 0) + (hasPhone ? 15 : 0) + (hasLocation ? 10 : 0) + 55 // depth & breadth
  const ScoreDIT = Math.min(100, Math.max(50, 100 - Math.floor(daysOld / 36))) // tenure
  const ScoreRIE = daysOld < 30 ? 60 : 70 // recent events proxy
  const ScoreIVSD = hasLocation ? 70 : 60 // source diversity proxy
  const ScoreBeh = 68 // behavioral placeholder

  // Consortium reputation mock
  const feedback: ReputationFeedbackInput[] = [
    { SCWi: 0.9, DYKi: isValid ? 1 : 0, WDBi: isValid ? 1 : 0, FRDi: FRD, FVC },
    { SCWi: 0.7, DYKi: isValid ? 1 : 0, WDBi: 0, FRDi: Math.max(0.7, FRD * 0.9), FVC: Math.min(0.7, FVC + 0.1) },
  ]
  const repWeights: ReputationWeights = { WDYK: 0.6, WWDB: 0.4, CF: 1.0 }
    const rep = computeConsortiumReputation(feedback, repWeights)
 
  const rawInputs = {
    ScoreIVH,
    ScoreABD,
    ScoreDIT,
    ScoreRIE,
    ScoreIVSD,
    ScoreRep: rep.total * 100, // convert 0–1 style to 0–100 scale if needed
    ScoreBeh,
  }
 
  const rawWeights: RawTrustWeights = {
    WIVH: 0.35,
    WABD: 0.3,
    WDIT: 0.15,
    WRIE: 0.1,
    WIVSD: 0.1,
    WRep: 0.15,
    WBeh: 0.15,
  }

  // Data quality
  const dqMetrics: DataQualityMetrics = {
    completeness: (hasEmail ? 15 : 0) + (hasPhone ? 15 : 0) + (hasLocation ? 10 : 0) + 60,
    consistency: 80,
    validity: isValid ? 85 : 65,
    accuracy: 77,
    timeliness: Math.max(60, 100 - Math.floor(daysOld / 18)),
    uniqueness: hasEmail ? 85 : 75,
    precision: 79,
    usability: (hasEmail ? 10 : 0) + (hasPhone ? 10 : 0) + 70,
  }

  // Source trustworthiness
  const stMetrics: SourceTrustworthinessMetrics = {
    security: 85,
    privacy: 84,
    ethics: 82,
    resiliency: 80,
    robustness: 81,
    reliability: 86,
    reputation: 83,
    transparency: 79,
    updateFrequency: 78,
  }

  return { rawInputs, rawWeights, rep, dqMetrics, stMetrics }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "query is required" }, { status: 400 })
    }

    const matches = mockSearchPeople(query)

    const results: ScoredPersonResult[] = matches.map((person) => {
      const rawInputs = deriveRawTrustInputs(person as any)
      const rawWeights: RawTrustWeights = {
        WIVH: 0.35,
        WABD: 0.3,
        WDIT: 0.15,
        WRIE: 0.1,
        WIVSD: 0.1,
        WRep: 0.15,
        WBeh: 0.15,
      }
      // Raw Trust Score
      const raw = computeRawTrustScore(rawInputs, rawWeights)

      // Confidence Score inputs derived per person
      const dq = computeDataQualityScore(deriveDataQualityMetrics(person as any))
      const st = computeSourceTrustworthiness(deriveSourceTrustworthinessMetrics(person as any))
      const cw = randomizeConfidenceWeights(0.4, 0.6)
      const confWeights: ConfidenceWeights = { WDQ: cw.WDQ, WST: cw.WST }
      const conf = computeConfidenceScore({ ScoreDQ: dq.total, ScoreST: st.total }, confWeights)

      // Final scores (both options)
      const MaxCS = 100
      const final = computeFinalScores({
        TSRaw: raw.total,
        CS: conf.total,
        MaxCS,
        InitialTrustEstimate: raw.total, // can be calibrated separately
        EmpiricalTrustScore: raw.total * (conf.total / MaxCS), // example empirical
      })

      return {
        ...person,
        scores: {
          TSRaw: raw.total,
          CS: conf.total,
          DIS_option1: final.option1.DIS,
          DIS_option2: final.option2.DIS,
        },
        score_breakdown: {
          raw_trust: raw,
          consortium_reputation: computeConsortiumReputation([
            { SCWi: 0.9, DYKi: 1 as const, WDBi: 1 as const, FRDi: 0.95, FVC: 0.8 },
            { SCWi: 0.7, DYKi: 1 as const, WDBi: 0 as const, FRDi: 0.9, FVC: 0.6 },
          ], { WDYK: 0.6, WWDB: 0.4, CF: 1.0 }),
          data_quality: dq,
          source_trust: st,
          confidence: conf,
          final,
        },
      }
    })

    const response: SearchPeopleResponse = {
      query,
      count: results.length,
      results,
    }

    return NextResponse.json(response)
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
} 