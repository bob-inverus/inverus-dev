import { tool } from "ai"
import { z } from "zod"
import { computeDataQualityScore } from "@/scoring/dataQuality"
import { computeSourceTrustworthiness } from "@/scoring/sourceTrustworthiness"
import { computeConsortiumReputation } from "@/scoring/consortiumReputation"
import { computeRawTrustScore } from "@/scoring/rawTrustScore"
import { computeConfidenceScore } from "@/scoring/confidenceScore"
import { computeFinalScores } from "@/scoring/finalScore"

interface PersonRecord {
  id: string
  name: string
  email?: string
  phone?: string
  city?: string
  state?: string
}

function mockSearchPeople(query: string): PersonRecord[] {
  const base: PersonRecord[] = [
    { id: "1", name: "Alice Johnson", email: "alice@example.com", city: "Boston", state: "MA" },
    { id: "2", name: "Bob Smith", email: "bob.smith@example.com", phone: "555-123-7890", city: "New York", state: "NY" },
    { id: "3", name: "Charlie Davis", email: "charlie@business.com", city: "San Francisco", state: "CA" },
  ]
  const q = query.toLowerCase()
  return base.filter((p) => Object.values(p).some((v) => String(v ?? "").toLowerCase().includes(q)))
}

export const identityScoringTool = tool({
  description: "Compute Digital Identity Trust and Confidence Scoring for people that match a query.",
  parameters: z.object({
    query: z.string().min(1, "query required"),
  }),
  execute: async ({ query }) => {
    const matches = mockSearchPeople(query)

    const results = matches.map((person) => {
      const hasEmail = Boolean(person.email)
      const hasPhone = Boolean(person.phone)
      const hasLocation = Boolean(person.city || person.state)

      const feedback = [
        { SCWi: 0.9, DYKi: 1 as const, WDBi: 1 as const, FRDi: 0.95, FVC: 0.8 },
        { SCWi: 0.7, DYKi: 1 as const, WDBi: 0 as const, FRDi: 0.9, FVC: 0.6 },
      ]
      const rep = computeConsortiumReputation(feedback, { WDYK: 0.6, WWDB: 0.4, CF: 1.0 })

      const raw = computeRawTrustScore(
        {
          ScoreIVH: hasEmail ? 80 : 60,
          ScoreABD: hasPhone ? 75 : 55,
          ScoreDIT: 70,
          ScoreRIE: 65,
          ScoreIVSD: hasLocation ? 70 : 60,
          ScoreRep: rep.total * 100,
          ScoreBeh: 68,
        },
        { WIVH: 0.35, WABD: 0.3, WDIT: 0.15, WRIE: 0.1, WIVSD: 0.1, WRep: 0.15, WBeh: 0.15 }
      )

      const dq = computeDataQualityScore({
        completeness: hasEmail || hasPhone ? 85 : 70,
        consistency: 80,
        validity: 78,
        accuracy: 77,
        timeliness: 75,
        uniqueness: 82,
        precision: 79,
        usability: 83,
      })

      const st = computeSourceTrustworthiness({
        security: 85,
        privacy: 84,
        ethics: 82,
        resiliency: 80,
        robustness: 81,
        reliability: 86,
        reputation: 83,
        transparency: 79,
        updateFrequency: 78,
      })

      const conf = computeConfidenceScore({ ScoreDQ: dq.total, ScoreST: st.total }, { WDQ: 0.6, WST: 0.4 })
      const final = computeFinalScores({
        TSRaw: raw.total,
        CS: conf.total,
        MaxCS: 100,
        InitialTrustEstimate: raw.total,
        EmpiricalTrustScore: raw.total * (conf.total / 100),
      })

      return {
        person,
        TSRaw: raw.total,
        CS: conf.total,
        DIS_option1: final.option1.DIS,
        DIS_option2: final.option2.DIS,
        breakdown: {
          raw_trust: raw,
          consortium_reputation: rep,
          data_quality: dq,
          source_trust: st,
          confidence: conf,
          final,
        },
      }
    })

    // For UI, provide a structured content block the client can detect
    return {
      content: [
        {
          type: "identity-scoring",
          query,
          count: results.length,
          results,
          top: results[0] ?? null,
        },
      ],
    }
  },
}) 