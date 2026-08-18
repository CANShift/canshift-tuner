import { describe, expect, it } from 'vitest'
import type { DashboardConfig, SignalDef, Widget } from '@canshift/core'
import { isUnboundWidget, unreadableWidgetCount } from './unbound-widgets'

const widget = (type: string, signal: string): Widget => ({ type, signal }) as Widget

const configWith = (widgets: Widget[][]): DashboardConfig =>
  ({ pages: widgets.map((w, i) => ({ id: `p${String(i)}`, widgets: w })) }) as DashboardConfig

const onCan = (name: string): SignalDef => ({ name, canFrameId: '0x1D0' }) as SignalDef
const polled = (name: string): SignalDef =>
  ({ name, canFrameId: '', polling: { mode: 1, pid: 5, intervalMs: 1000 } }) as SignalDef
const orphan = (name: string): SignalDef => ({ name, canFrameId: '' }) as SignalDef

describe('isUnboundWidget', () => {
  it('flags signal-consuming widgets with an empty signal', () => {
    expect(isUnboundWidget(widget('gauge', ''))).toBe(true)
    expect(isUnboundWidget(widget('gear', ''))).toBe(true)
    expect(isUnboundWidget(widget('warning', ''))).toBe(true)
    expect(isUnboundWidget(widget('shift_light', ''))).toBe(true)
  })

  it('ignores bound widgets and non-consuming types', () => {
    expect(isUnboundWidget(widget('gauge', 'rpm'))).toBe(false)
    expect(isUnboundWidget(widget('button', ''))).toBe(false)
    expect(isUnboundWidget(widget('image', ''))).toBe(false)
    expect(isUnboundWidget(widget('timer', ''))).toBe(false)
  })
})

describe('unreadableWidgetCount', () => {
  it('counts an empty signal across all pages', () => {
    const config = configWith([
      [widget('gauge', ''), widget('gauge', 'rpm')],
      [widget('gear', ''), widget('button', '')],
    ])
    expect(unreadableWidgetCount(config, [onCan('rpm')])).toBe(2)
  })

  it('counts a widget bound to a signal the dash cannot read', () => {
    const config = configWith([[widget('gauge', 'ghost')]])
    expect(unreadableWidgetCount(config, [orphan('ghost')])).toBe(1)
  })

  it('accepts a polled PID as a binding, exactly as a CAN id is', () => {
    const config = configWith([[widget('gauge', 'coolant_temp_c')]])
    expect(unreadableWidgetCount(config, [polled('coolant_temp_c')])).toBe(0)
  })

  it('counts a widget bound to a signal that is not in the profile at all', () => {
    const config = configWith([[widget('gauge', 'nitrous')]])
    expect(unreadableWidgetCount(config, [onCan('rpm')])).toBe(1)
  })

  it('returns 0 for a null config', () => {
    expect(unreadableWidgetCount(null, [])).toBe(0)
  })
})
