import { describe, expect, it } from 'vitest'
import { matchCars, MAX_SUGGESTIONS } from './match-cars'
import type { CarFingerprint } from './fingerprints'

const print = (key: string, ids: number[]): CarFingerprint => ({
  key,
  label: key,
  frameIds: new Set(ids),
})

const MAXXECU = print('maxxecu', [0x370, 0x371, 0x372, 0x373, 0x374, 0x375])
const AEM = print('aem', [0x1f0a000, 0x1f0a003])
const SINGLE = print('single', [0x100])

describe('matchCars confidence', () => {
  it('calls a car strong when the bus carries most of its frames', () => {
    const seen = new Set([0x370, 0x371, 0x372, 0x373, 0x374, 0x7e0])
    expect(matchCars(seen, [MAXXECU, AEM])).toEqual([
      {
        key: 'maxxecu',
        label: 'maxxecu',
        matched: 5,
        total: 6,
        coverage: 5 / 6,
        confidence: 'strong',
      },
    ])
  })

  it('only calls a car possible when half its frames are there', () => {
    const [match] = matchCars(new Set([0x370, 0x371, 0x372]), [MAXXECU])
    expect(match?.confidence).toBe('possible')
  })

  it('never calls a one-frame fingerprint strong', () => {
    const [match] = matchCars(new Set([0x100]), [SINGLE])
    expect(match).toMatchObject({ coverage: 1, confidence: 'possible' })
  })
})

describe('matchCars thresholds', () => {
  it('suggests nothing below half coverage', () => {
    expect(matchCars(new Set([0x370, 0x371]), [MAXXECU])).toEqual([])
  })

  it('suggests nothing on a bus that shares no frame with the catalogue', () => {
    expect(matchCars(new Set([0x123, 0x456]), [MAXXECU, AEM, SINGLE])).toEqual([])
  })
})

describe('matchCars ranking', () => {
  it('ranks by coverage, then by matched frames', () => {
    const wide = print('wide', [1, 2, 3, 4])
    const narrow = print('narrow', [1, 2])
    const partial = print('partial', [1, 2, 3, 9])
    const keys = matchCars(new Set([1, 2, 3, 4]), [partial, narrow, wide]).map((m) => m.key)
    expect(keys).toEqual(['wide', 'narrow', 'partial'])
  })

  it('caps the suggestions', () => {
    const prints = ['a', 'b', 'c', 'd', 'e'].map((key) => print(key, [1, 2]))
    expect(matchCars(new Set([1, 2]), prints)).toHaveLength(MAX_SUGGESTIONS)
  })
})
