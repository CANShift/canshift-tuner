import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WIDGET_ZONE_COLORS, type GaugeWidgetConfig, type Widget } from '@canshift/core'
import { GaugeArcPreview } from './GaugeArc'

const TEXT_COLOR = '#FFFFFF'
const CRITICAL_COLOR = '#FF4444'

const oilPressure: Widget = {
  signal: 'oil_press_bar',
  style: { textColor: TEXT_COLOR, criticalColor: CRITICAL_COLOR },
  config: {
    type: 'gauge',
    displayStyle: 'arc',
    minValue: 0,
    maxValue: 8,
    dangerLevel: 1.5,
    dangerBelow: true,
    decimalPlaces: 1,
  } as GaugeWidgetConfig,
} as Widget

const valueInk = (testValue: number, unbound = false, widget = oilPressure): string | undefined => {
  const markup = renderToStaticMarkup(
    <GaugeArcPreview
      widget={widget}
      w={200}
      h={200}
      scale={1}
      revLimiting={false}
      danger={false}
      testValue={testValue}
      toDisplay={(value) => value}
      unbound={unbound}
    />
  )
  return /<text[^>]*fill="([^"]+)"[^>]*font-weight="900"/.exec(markup)?.[1]
}

describe('the arc gauge value ink', () => {
  it('turns critical when a low-side gauge drops to its level', () => {
    expect(valueInk(1.2)).toBe(CRITICAL_COLOR)
  })

  it('stays plain while a low-side gauge sits above its level', () => {
    expect(valueInk(5.2)).toBe(TEXT_COLOR)
  })

  it('turns amber between a widget warn level and danger', () => {
    const warned = { ...oilPressure, config: { ...oilPressure.config, warnLevel: 2.5 } } as Widget
    expect(valueInk(2.0, false, warned)).toBe(WIDGET_ZONE_COLORS.warning)
  })

  it('stays plain on an unbound gauge', () => {
    expect(valueInk(1.2, true)).toBe(TEXT_COLOR)
  })
})
