import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { gaugeValueFontSize, gearFontSize } from '@canshift/core'

const GAUGE_CPP = resolve(
  import.meta.dirname,
  '../../../../../canshift-firmware/src/ui/widgets/gauge_widget.cpp'
)

const constant = (source: string, name: string): number | null => {
  const match = new RegExp(`constexpr\\s+\\w+\\s+${name}\\s*=\\s*(\\d+)`).exec(source)
  return match ? Number(match[1]) : null
}

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

const describeIfFirmware = existsSync(GAUGE_CPP) ? describe : describe.skip

describeIfFirmware('gauge value font firmware parity', () => {
  const source = existsSync(GAUGE_CPP) ? readFileSync(GAUGE_CPP, 'utf8') : ''

  it('uses the same breakpoints the firmware compiles in', () => {
    expect(constant(source, 'kValueFontHeightPrimary')).toBe(90)
    expect(constant(source, 'kValueFontSizePrimary')).toBe(48)
    expect(constant(source, 'kValueFontHeightSecondary')).toBe(40)
    expect(constant(source, 'kValueFontSizeSecondary')).toBe(17)
    expect(constant(source, 'kValueFontSizeUnits')).toBe(10)
  })
})
