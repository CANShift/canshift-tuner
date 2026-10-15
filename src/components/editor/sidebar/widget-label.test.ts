import { describe, expect, it } from 'vitest'
import type { Widget } from '@canshift/core'
import { widgetLabel } from './widget-label'

const widget = (fields: Partial<Widget> & { config: Widget['config'] }): Widget =>
  ({ id: 'w', type: fields.config.type, signal: '', ...fields }) as Widget

describe('widgetLabel', () => {
  it('uses a button kicker, then its label', () => {
    expect(
      widgetLabel(widget({ config: { type: 'button', label: 'Go', kicker: 'MAP' } } as never))
    ).toBe('MAP')
    expect(widgetLabel(widget({ config: { type: 'button', label: 'Go' } } as never))).toBe('Go')
  })

  it('uses the dash label of the bound signal', () => {
    expect(
      widgetLabel(widget({ signal: 'coolant_temp_c', config: { type: 'gauge' } } as never))
    ).toBe('WATER')
  })
})

describe('widgetLabel — authored kickers', () => {
  it('prefers an authored gauge or gear kicker over the signal label', () => {
    expect(
      widgetLabel(
        widget({ signal: 'coolant_temp_c', config: { type: 'gauge', kicker: 'H2O' } } as never)
      )
    ).toBe('H2O')
    expect(
      widgetLabel(widget({ signal: 'gear', config: { type: 'gear', kicker: 'BOX' } } as never))
    ).toBe('BOX')
  })

  it('ignores an empty authored kicker', () => {
    expect(
      widgetLabel(
        widget({ signal: 'coolant_temp_c', config: { type: 'gauge', kicker: '' } } as never)
      )
    ).toBe('WATER')
  })

  it('falls back to the widget type', () => {
    expect(widgetLabel(widget({ config: { type: 'gear' } } as never))).toBe('GEAR')
  })
})
