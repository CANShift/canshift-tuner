import type { SignalDef } from '@canshift/core'
import type { DatalogSession } from '@canshift/core/wire'
import { describe, expect, it } from 'vitest'
import { buildSessionCsv, sessionCsvFilename } from './session-csv'

const signal = (name: string, unit: string): SignalDef => ({ name, unit }) as unknown as SignalDef

const KNOWN = [signal('rpm', 'rpm'), signal('coolant_temp_c', '°C')]

const session = (overrides: Partial<DatalogSession> = {}): DatalogSession => ({
  header: {
    samplePeriodMs: 50,
    session: 3,
    signals: [
      { id: 0, name: 'rpm' },
      { id: 5, name: 'coolant_temp_c' },
      { id: 12, name: 'gear' },
    ],
  },
  samples: [
    { tMs: 0, values: { rpm: 3500, coolant_temp_c: 88 } },
    { tMs: 50, values: { rpm: 3600, coolant_temp_c: 88, gear: 3 } },
    { tMs: 1000, values: { rpm: 4000, gear: 4 } },
  ],
  laps: [],
  end: { tMs: 1000, dropped: 0 },
  truncated: false,
  ...overrides,
})

describe('buildSessionCsv', () => {
  it('heads the recorded signals in catalogue order, with their units', () => {
    const [head] = buildSessionCsv(session(), KNOWN, 'metric').split('\n')
    expect(head).toBe('seconds,rpm (rpm),coolant_temp_c (°C),gear')
  })

  it('keeps the 20 Hz sample time to the hundredth of a second', () => {
    const rows = buildSessionCsv(session(), KNOWN, 'metric').split('\n')
    expect(rows[1]).toBe('0.00,3500,88,')
    expect(rows[2]).toBe('0.05,3600,88,3')
  })

  it('leaves out a signal the session never recorded', () => {
    const quiet = session({ samples: [{ tMs: 0, values: { rpm: 900 } }] })
    expect(buildSessionCsv(quiet, KNOWN, 'metric').split('\n')[0]).toBe('seconds,rpm (rpm)')
  })

  it('numbers the lap each sample belongs to once the session has laps', () => {
    const lapped = session({ laps: [{ tMs: 50, index: 1, lapMs: 50 }] })
    const rows = buildSessionCsv(lapped, KNOWN, 'metric').split('\n')
    expect(rows[0]?.startsWith('seconds,lap,')).toBe(true)
    expect(rows[1]?.split(',')[1]).toBe('1')
    expect(rows[2]?.split(',')[1]).toBe('2')
  })
})

describe('buildSessionCsv precision', () => {
  it('writes a recorded float with the digits it really carries', () => {
    const noisy = session({ samples: [{ tMs: 0, values: { rpm: 1000.0499877929688 } }] })
    expect(buildSessionCsv(noisy, KNOWN, 'metric').split('\n')[1]).toBe('0.00,1000.05')
  })
})

describe('sessionCsvFilename', () => {
  it('swaps the session extension for .csv', () => {
    expect(sessionCsvFilename('S00003.csl')).toBe('S00003.csv')
  })
})
