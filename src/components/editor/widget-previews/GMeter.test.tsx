import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { G_METER, type Widget } from '@canshift/core'
import { GMeterPreview } from './GMeter'

const gMeter = (config: Record<string, unknown> = {}): Widget =>
  ({
    id: 'g',
    type: 'g_meter',
    signal: '',
    style: { textColor: '#FFFFFF' },
    config: { type: 'g_meter', rangeG: 1.5, ...config },
  }) as unknown as Widget

const render = (widget: Widget, locked: boolean): string =>
  renderToStaticMarkup(<GMeterPreview widget={widget} w={400} h={300} scale={2} locked={locked} />)

describe('the g-meter preview', () => {
  it('draws the dot, the envelope and the reading when the board has an IMU', () => {
    const markup = render(gMeter(), false)
    expect(markup).toContain('<rect')
    expect(markup).toContain('<polyline')
    expect(markup).toContain('0.65')
    expect(markup).toContain(`>${G_METER.defaultKicker}<`)
  })

  it('leaves the envelope out when peak hold is off', () => {
    expect(render(gMeter({ peakHold: false }), false)).not.toContain('<polyline')
  })

  it('renders the unavailable state when the board has none', () => {
    const markup = render(gMeter({ kicker: 'Lat g' }), true)
    expect(markup).toContain(`LAT G · ${G_METER.noImuReason}`)
    expect(markup).not.toContain('<rect')
    expect(markup).not.toContain('0.65')
  })

  it('sizes the plot in device pixels and scales it to the canvas', () => {
    const markup = render(gMeter(), false)
    expect(markup).toContain('viewBox="0 0 140 140"')
    expect(markup).toContain('width:280px')
  })
})
