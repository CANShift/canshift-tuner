import { describe, expect, it } from 'vitest'
import { fitScale } from './useCarouselScale'

const PANEL = { width: 320, height: 240 }

describe('fitScale', () => {
  it('fits a tall desktop strip by its height', () => {
    expect(fitScale({ width: 1200, height: 480 }, PANEL)).toBe(2)
  })

  it('fits a phone-width strip by its width', () => {
    expect(fitScale({ width: 366, height: 600 }, PANEL)).toBeCloseTo(366 / 320)
  })

  it('stays within the readable range', () => {
    expect(fitScale({ width: 100, height: 100 }, PANEL)).toBe(0.5)
    expect(fitScale({ width: 4000, height: 4000 }, PANEL)).toBe(3)
  })

  it('waits for a strip that has no size yet', () => {
    expect(fitScale({ width: 0, height: 300 }, PANEL)).toBeNull()
  })
})
