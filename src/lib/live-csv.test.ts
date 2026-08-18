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
    const [head] = buildLiveCsv(SIGNALS, SAMPLES, 'metric').split('\n')
    expect(head).toBe('seconds,rpm (rpm),water (°C),gear')
  })

  it('writes one row per sample, in order, with the elapsed second', () => {
    const rows = buildLiveCsv(SIGNALS, SAMPLES, 'metric').split('\n')
    expect(rows).toHaveLength(3)
    expect(rows[1]).toBe('0.0,5200,88,')
    expect(rows[2]).toBe('0.1,5310.5,88,4')
  })

  it('leaves a cell empty rather than inventing a value the app never received', () => {
    expect(buildLiveCsv(SIGNALS, SAMPLES, 'metric').split('\n')[1]?.endsWith(',')).toBe(true)
  })

  it('quotes a field that would break the format', () => {
    const csv = buildLiveCsv(
      [signal('oil, hot', 'bar')],
      [{ t: 0, values: { 'oil, hot': 1 } }],
      'metric'
    )
    expect(csv.split('\n')[0]).toBe('seconds,"oil, hot (bar)"')
  })

  it('writes the imperial unit in the header and the converted value in the row', () => {
    const csv = buildLiveCsv(
      [signal('coolant', '°C')],
      [{ t: 0, values: { coolant: 100 } }],
      'imperial'
    )
    const [head, row] = csv.split('\n')
    expect(head).toBe('seconds,coolant (°F)')
    expect(row).toBe('0.0,212')
  })

  it('produces a header even with no samples, so an empty recording is still readable', () => {
    expect(buildLiveCsv(SIGNALS, [], 'metric').split('\n')).toHaveLength(1)
  })
})
