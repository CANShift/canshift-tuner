import type { CarFingerprint } from './fingerprints'

export type MatchConfidence = 'strong' | 'possible'

export interface CarMatch {
  key: string
  label: string
  matched: number
  total: number
  coverage: number
  confidence: MatchConfidence
}

const STRONG_COVERAGE = 0.8
const STRONG_MIN_FRAMES = 2
const POSSIBLE_COVERAGE = 0.5
export const MAX_SUGGESTIONS = 3

const confidenceOf = (matched: number, coverage: number): MatchConfidence | null => {
  if (matched >= STRONG_MIN_FRAMES && coverage >= STRONG_COVERAGE) return 'strong'
  return coverage >= POSSIBLE_COVERAGE ? 'possible' : null
}

const scoreOf = (print: CarFingerprint, seen: ReadonlySet<number>): CarMatch | null => {
  const matched = [...print.frameIds].filter((id) => seen.has(id)).length
  const total = print.frameIds.size
  const coverage = total === 0 ? 0 : matched / total
  const confidence = confidenceOf(matched, coverage)
  if (confidence === null) return null
  return { key: print.key, label: print.label, matched, total, coverage, confidence }
}

const byStrength = (a: CarMatch, b: CarMatch): number =>
  b.coverage - a.coverage || b.matched - a.matched || a.label.localeCompare(b.label)

export const matchCars = (
  seen: ReadonlySet<number>,
  prints: readonly CarFingerprint[]
): CarMatch[] =>
  prints
    .map((print) => scoreOf(print, seen))
    .filter((match) => match !== null)
    .sort(byStrength)
    .slice(0, MAX_SUGGESTIONS)
