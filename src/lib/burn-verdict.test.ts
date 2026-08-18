import type { DashboardConfig } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { burnBlocks, burnLabel, burnVerdict, configVerdict, type BurnInputs } from './burn-verdict'

const config = (widgets: { type: string; signal: string }[] = []): DashboardConfig =>
  ({
    topBar: { height: 24 },
    pages: [
      {
        id: 'page-1',
        showTopBar: true,
        widgets: widgets.map((widget, index) => ({
          id: `w-${String(index)}`,
          type: widget.type,
          signal: widget.signal,
          layout: { col: 0, colSpan: 3, row: 0, rowSpan: 2, zOrder: 0 },
        })),
      },
    ],
  }) as unknown as DashboardConfig

const inputs = (overrides: Partial<BurnInputs> = {}): BurnInputs => ({
  hasDevice: true,
  simulation: false,
  firmwareMismatch: false,
  config: config([{ type: 'gauge', signal: 'rpm' }]),
  isDirty: true,
  ...overrides,
})

describe('burnVerdict', () => {
  it('is ready when a board is attached, the layout fits and everything is bound', () => {
    const verdict = burnVerdict(inputs())
    expect(verdict.kind).toBe('ready')
    expect(burnLabel(verdict)).toBe('BURN')
    expect(burnBlocks(verdict)).toBe(false)
  })

  it('reads NO DEVICE with no board, and in simulation — burning is disabled either way', () => {
    expect(burnLabel(burnVerdict(inputs({ hasDevice: false })))).toBe('NO DEVICE')
    expect(burnLabel(burnVerdict(inputs({ simulation: true })))).toBe('NO DEVICE')
  })

  it('puts the device first: a config with problems still reads NO DEVICE without a board', () => {
    const verdict = burnVerdict(
      inputs({ hasDevice: false, config: config([{ type: 'gauge', signal: '' }]) })
    )
    expect(verdict.kind).toBe('no-device')
  })

  it('counts the widgets that would render nothing on the device', () => {
    const verdict = burnVerdict(
      inputs({
        config: config([
          { type: 'gauge', signal: 'rpm' },
          { type: 'gauge', signal: '' },
          { type: 'gear', signal: '' },
        ]),
      })
    )
    expect(verdict).toEqual({ kind: 'unbound', count: 2 })
    expect(burnLabel(verdict)).toBe('2 UNBOUND')
  })

  it('blocks the burn on unbound widgets rather than offering to write them anyway', () => {
    const verdict = burnVerdict(inputs({ config: config([{ type: 'gauge', signal: '' }]) }))
    expect(burnBlocks(verdict)).toBe(true)
  })

  it('says nothing to burn when the config has not changed', () => {
    const verdict = burnVerdict(inputs({ isDirty: false }))
    expect(verdict.kind).toBe('clean')
    expect(burnLabel(verdict)).toBe('BURN')
    expect(burnBlocks(verdict)).toBe(true)
  })

  it('refuses a firmware mismatch before it looks at the layout', () => {
    const verdict = burnVerdict(inputs({ firmwareMismatch: true }))
    expect(verdict.kind).toBe('firmware-mismatch')
  })
})

describe('configVerdict', () => {
  it('reports a config problem regardless of whether a board is attached', () => {
    const verdict = configVerdict(config([{ type: 'gauge', signal: '' }]))
    expect(verdict).toEqual({ kind: 'unbound', count: 1 })
  })

  it('is ok on a config with nothing wrong, and on no config at all', () => {
    expect(configVerdict(config([{ type: 'gauge', signal: 'rpm' }])).kind).toBe('ok')
    expect(configVerdict(null).kind).toBe('ok')
  })
})
