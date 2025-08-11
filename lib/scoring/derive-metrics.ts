import { type DataQualityMetrics } from "@/scoring/dataQuality"
import { type SourceTrustworthinessMetrics } from "@/scoring/sourceTrustworthiness"
import { type RawTrustInputs } from "@/scoring/rawTrustScore"
import { computeConsortiumReputation, type ReputationFeedbackInput, type ReputationWeights } from "@/scoring/consortiumReputation"

function isCorporateDomain(domain: string | null): boolean {
  if (!domain) return false
  const freeDomains = new Set([
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
  ])
  return !freeDomains.has(domain.toLowerCase())
}

function extractEmailDomain(email: string | null): string | null {
  if (!email) return null
  const parts = String(email).split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : null
}

function parseDaysOld(dateLike: any): number | null {
  if (!dateLike) return null
  try {
    const d = new Date(dateLike)
    if (Number.isNaN(d.getTime())) return null
    const now = Date.now()
    const diffMs = Math.max(0, now - d.getTime())
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

export function deriveDataQualityMetrics(record: Record<string, any>): DataQualityMetrics {
  const email = record.email || record.Email
  const phone = record.phone || record["Mobile Phone"] || record.mobile_phone
  const city = record.city || record.City
  const state = record.state || record.State
  const address = record.address || record.Address
  const isValid = record["Is Valid"] === true || String(record.Status || record.Result || "").toLowerCase() === "valid"

  const daysOld = parseDaysOld(record.reg_date || record.regDate || record.registered_at)
  const emailDomain = extractEmailDomain(email ?? null)
  const isCorp = isCorporateDomain(emailDomain)

  const hasEmail = Boolean(email)
  const hasPhone = Boolean(phone)
  const hasLocation = Boolean(city || state)
  const hasAddress = Boolean(address)

  const completeness = 50
    + (hasEmail ? 15 : 0)
    + (hasPhone ? 15 : 0)
    + (hasLocation ? 10 : 0)
    + (hasAddress ? 5 : 0)

  const consistency = (() => {
    const first = record.first_name || record.First_Name || record.firstName
    const last = record.last_name || record.Last_Name || record.lastName
    const name = record.name || record.Name
    if (first && last && name) {
      const combined = `${String(first)} ${String(last)}`.trim().toLowerCase()
      return combined === String(name).trim().toLowerCase() ? 85 : 75
    }
    return 78
  })()

  const validity = isValid ? 85 : (() => {
    const emailLooksValid = typeof email === "string" && /.+@.+\..+/.test(email)
    const phoneDigits = String(phone ?? "").replace(/\D/g, "")
    const phoneLooksValid = phoneDigits.length >= 10
    return 65 + (emailLooksValid ? 8 : 0) + (phoneLooksValid ? 5 : 0)
  })()

  const accuracy = 72 + (isCorp ? 6 : 0) + (hasAddress ? 2 : 0)

  const timeliness = Math.max(60, 100 - Math.floor((daysOld ?? 365) / 18))

  const uniqueness = hasEmail ? (isCorp ? 88 : 82) : 75

  const precision = 77 + (hasAddress ? 4 : 0)

  const usability = 68 + (hasEmail ? 6 : 0) + (hasPhone ? 6 : 0)

  return {
    completeness,
    consistency,
    validity: Math.min(100, validity),
    accuracy: Math.min(100, accuracy),
    timeliness,
    uniqueness,
    precision: Math.min(100, precision),
    usability: Math.min(100, usability),
  }
}

export function deriveSourceTrustworthinessMetrics(record: Record<string, any>): SourceTrustworthinessMetrics {
  const email = record.email || record.Email
  const emailDomain = extractEmailDomain(email ?? null)
  const isCorp = isCorporateDomain(emailDomain)

  const daysOld = parseDaysOld(record.reg_date || record.regDate || record.registered_at)
  const updateFrequency = daysOld == null ? 78 : Math.max(70, 100 - Math.floor(daysOld / 24))

  const base = isCorp ? 84 : 80

  return {
    security: base + (isCorp ? 2 : 0),
    privacy: base + (isCorp ? 2 : 0),
    ethics: base - 2,
    resiliency: base - 3,
    robustness: base - 3,
    reliability: base + (isCorp ? 4 : 0),
    reputation: base + (isCorp ? 3 : -1),
    transparency: base - 4,
    updateFrequency,
  }
}

export function deriveRawTrustInputs(record: Record<string, any>): RawTrustInputs {
  const email = record.email || record.Email
  const phone = record.phone || record["Mobile Phone"] || record.mobile_phone
  const city = record.city || record.City
  const state = record.state || record.State
  const address = record.address || record.Address
  const isValid = record["Is Valid"] === true || String(record.Status || record.Result || "").toLowerCase() === "valid"

  const hasEmail = Boolean(email)
  const hasPhone = Boolean(phone)
  const hasLocation = Boolean(city || state)
  const hasAddress = Boolean(address)

  const daysOld = parseDaysOld(record.reg_date || record.regDate || record.registered_at) ?? 365

  const FVC = Math.min(0.9, 0.4 + (hasEmail ? 0.2 : 0) + (hasPhone ? 0.15 : 0) + (hasAddress ? 0.15 : 0))
  const FRD = Math.exp(-0.01 * daysOld)

  const feedback: ReputationFeedbackInput[] = [
    { SCWi: 0.9, DYKi: isValid ? 1 : 0, WDBi: isValid ? 1 : 0, FRDi: FRD, FVC },
    { SCWi: 0.7, DYKi: isValid ? 1 : 0, WDBi: 0, FRDi: Math.max(0.7, FRD * 0.9), FVC: Math.max(0.6, FVC - 0.1) },
  ]
  const repWeights: ReputationWeights = { WDYK: 0.6, WWDB: 0.4, CF: 1.0 }
  const rep = computeConsortiumReputation(feedback, repWeights)

  const ScoreIVH = isValid ? 85 : (hasEmail ? 75 : 60)

  const presentSignals = (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0) + (hasLocation ? 1 : 0) + (hasAddress ? 1 : 0)
  const ScoreABD = 55 + presentSignals * 12 // 55..103

  const ScoreDIT = Math.min(100, Math.max(50, 100 - Math.floor(daysOld / 36)))

  const ScoreRIE = daysOld < 30 ? 65 : daysOld < 180 ? 70 : 62

  const ScoreIVSD = 60 + Math.min(15, presentSignals * 5) // 60..75

  const ScoreRep = rep.total * 100

  const ScoreBeh = 64 + (hasPhone ? 4 : 0) + (hasEmail ? 2 : 0) // 64..70

  return {
    ScoreIVH,
    ScoreABD,
    ScoreDIT,
    ScoreRIE,
    ScoreIVSD,
    ScoreRep,
    ScoreBeh,
  }
}

export function randomizeConfidenceWeights(min = 0.4, max = 0.6): { WDQ: number; WST: number } {
  const wdq = Math.random() * (max - min) + min
  const wst = 1 - wdq
  return { WDQ: wdq, WST: wst }
} 