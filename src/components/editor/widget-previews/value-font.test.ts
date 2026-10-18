import { describe, expect, it } from 'vitest'
import { gaugeValueFontSize, gearFontSize } from '@canshift/core'

describe('the value font follows the device, not the box', () => {
  it('steps rather than scaling continuously', () => {
    expect(gaugeValueFontSize(120, undefined)).toBe(48)
    expect(gaugeValueFontSize(90, undefined)).toBe(48)
    expect(gaugeValueFontSize(89, undefined)).toBe(17)
    expect(gaugeValueFontSize(40, undefined)).toBe(17)
    expect(gaugeValueFontSize(39, undefined)).toBe(10)
  })

  it('lets a declared class win over the box, in both directions', () => {
    expect(gaugeValueFontSize(500, 64)).toBe(32)
    expect(gaugeValueFontSize(20, 96)).toBe(48)
  })

  it('keeps a widget that declares a class larger than a short one that does not', () => {
    const declared = gaugeValueFontSize(120, 64)
    const shortBox = gaugeValueFontSize(50, undefined)
    expect(declared).toBeGreaterThan(shortBox)
  })

  it('sizes a gear from both edges of its box', () => {
    expect(gearFontSize(100, 100)).toBe(gearFontSize(100, 100))
    expect(gearFontSize(20, 100)).toBeLessThan(gearFontSize(100, 100))
  })
})
