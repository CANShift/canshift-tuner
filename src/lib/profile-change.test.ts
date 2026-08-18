import { describe, expect, it } from 'vitest'
import type { DashboardConfig, SignalDef, Widget } from '@canshift/core'
import { changeSummary, lostBindingCount, parseProfileFile } from './profile-change'
import { serializeProfileXml } from './profile-xml'

const widget = (signal: string): Widget => ({ type: 'gauge', signal }) as Widget

const configWith = (widgets: Widget[][]): DashboardConfig =>
  ({ pages: widgets.map((w, i) => ({ id: `p${String(i)}`, widgets: w })) }) as DashboardConfig

const named = (name: string): SignalDef => ({ name }) as SignalDef

const RPM: SignalDef = {
  name: 'rpm',
  canFrameId: '0x370',
  startByte: 0,
  byteLength: 2,
  bigEndian: true,
  signed: false,
  scale: 1,
  offset: 0,
  unit: 'rpm',
  min: 0,
  max: 8000,
  timeoutMs: 500,
}

describe('lostBindingCount', () => {
  it('counts widgets whose signal the incoming profile does not define', () => {
    const config = configWith([
      [widget('rpm'), widget('boost')],
      [widget('egt'), widget('')],
    ])
    expect(lostBindingCount(config, [named('rpm')])).toBe(2)
  })

  it('counts nothing when every bound name survives', () => {
    const config = configWith([[widget('rpm'), widget('boost')]])
    expect(lostBindingCount(config, [named('rpm'), named('boost')])).toBe(0)
  })

  it('counts nothing when there is no config yet', () => {
    expect(lostBindingCount(null, [])).toBe(0)
  })
})

describe('changeSummary', () => {
  it('reassures when no binding is lost', () => {
    expect(changeSummary('MaxxECU', [named('a')], [named('a'), named('b')], 0)).toBe(
      'MaxxECU — 2 signals replacing 1. No bound widget loses its signal.'
    )
  })

  it('names the cost in widgets when bindings are lost', () => {
    expect(changeSummary('Haltech', [named('a')], [named('b')], 1)).toBe(
      'Haltech — 1 signals replacing 1. 1 bound widget loses its signal.'
    )
  })
})

describe('parseProfileFile', () => {
  it('reads back a profile the tuner wrote', () => {
    const result = parseProfileFile('mine.xml', serializeProfileXml([RPM]))
    expect(result).toEqual({ kind: 'ok', signals: [RPM], warnings: [] })
  })

  it('falls through to the vendor parser for a foreign CAN XML', () => {
    const result = parseProfileFile('vendor.xml', '<RealDashCAN version="2"></RealDashCAN>')
    expect(result.kind).toBe('error')
  })

  it('names the file in the failure so the user knows which one was rejected', () => {
    const result = parseProfileFile('junk.xml', 'not xml at all')
    expect(result.kind).toBe('error')
    if (result.kind === 'error') expect(result.message).toContain('junk.xml')
  })
})
