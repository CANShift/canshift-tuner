import { describe, expect, it } from 'vitest'
import { displayValue } from '@canshift/core'
import { shownValue } from './gauge-math'

const inImperial =
  (declaredUnit: string) =>
  (value: number): number =>
    displayValue(value, declaredUnit, 'imperial')

const unconverted = (value: number): number => value

describe('the value a gauge preview shows', () => {
  it('converts the value the way the device does', () => {
    const { raw } = shownValue(100, 0, 300, inImperial('km/h'))
    expect(raw).toBeCloseTo(62.14, 2)
  })

  it('converts the bounds too, so the sweep survives an offset unit', () => {
    const { pct, raw } = shownValue(90, 0, 120, inImperial('°C'))
    expect(raw).toBeCloseTo(194, 5)
    expect(pct).toBeCloseTo(0.75, 5)
  })

  it('places the demo value inside the converted range', () => {
    const { pct, raw } = shownValue(null, 0, 120, inImperial('°C'))
    expect(pct).toBeCloseTo(0.65, 5)
    expect(raw).toBeCloseTo(172.4, 5)
  })

  it('leaves everything alone when nothing converts', () => {
    const { pct, raw } = shownValue(4500, 0, 9000, unconverted)
    expect(raw).toBe(4500)
    expect(pct).toBeCloseTo(0.5, 5)
  })

  it('clamps a value past the converted bounds', () => {
    const { pct } = shownValue(400, 0, 300, inImperial('km/h'))
    expect(pct).toBe(1)
  })
})
