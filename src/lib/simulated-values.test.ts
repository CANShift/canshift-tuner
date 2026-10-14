import { describe, expect, it } from 'vitest'
import type { SignalDef } from '@canshift/core'
import { simulatedValues } from './simulated-values'

const signal = (name: string, min: number, max: number) => ({ name, min, max }) as SignalDef

describe('simulatedValues', () => {
  it('keeps every signal inside its own range', () => {
    const signals = [signal('rpm', 0, 8000), signal('iat_c', -40, 100)]
    for (const t of [0, 1.7, 9.3, 42]) {
      const values = simulatedValues(signals, t)
      expect(values.rpm).toBeGreaterThanOrEqual(0)
      expect(values.rpm).toBeLessThanOrEqual(8000)
      expect(values.iat_c).toBeGreaterThanOrEqual(-40)
      expect(values.iat_c).toBeLessThanOrEqual(100)
    }
  })

  it('starts the first signal half way through its range', () => {
    expect(simulatedValues([signal('rpm', 0, 8000)], 0).rpm).toBeCloseTo(4000)
  })
})
