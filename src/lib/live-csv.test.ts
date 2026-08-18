import type { SignalDef } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { buildLiveCsv } from './live-csv'

const signal = (name: string, unit: string): SignalDef => ({ name, unit }) as unknown as SignalDef

const SIGNALS = [signal('rpm', 'rpm'), signal('water', '°C'), signal('gear', '')]

const SAMPLES = [
  { t: 0, values: { rpm: 5200, water: 88 } },
  { t: 0.1, values: { rpm: 5310.5, water: 88, gear: 4 } },
]

describe('buildLiveCsv', () => {
  it('heads every column with the signal and its unit', () => {
    const [head] = buildLiveCsv(SIGNALS, SAMPLES).split('\n')
    expect(head).toBe('seconds,rpm (rpm),water (°C),gear')
  })

  it('writes one row per sample, in order, with the elapsed second', () => {
    const rows = buildLiveCsv(SIGNALS, SAMPLES).split('\n')
    expect(rows).toHaveLength(3)
    expect(rows[1]).toBe('0.0,5200,88,')
    expect(rows[2]).toBe('0.1,5310.5,88,4')
  })

  it('leaves a cell empty rather than inventing a value the app never received', () => {
    expect(buildLiveCsv(SIGNALS, SAMPLES).split('\n')[1]?.endsWith(',')).toBe(true)
  })

  it('quotes a field that would break the format', () => {
    const csv = buildLiveCsv([signal('oil, hot', 'bar')], [{ t: 0, values: { 'oil, hot': 1 } }])
    expect(csv.split('\n')[0]).toBe('seconds,"oil, hot (bar)"')
  })

  it('produces a header even with no samples, so an empty recording is still readable', () => {
    expect(buildLiveCsv(SIGNALS, []).split('\n')).toHaveLength(1)
  })
})
