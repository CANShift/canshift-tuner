import type { GaugeWidgetConfig, SignalDef, Widget } from '@canshift/core'
import { NEW_WIDGET_STYLE, SHIFT_LIGHT_RED_SEGMENTS } from '../new-widget'
import { pairWidget } from '../widget-patch'
import type { SignalSlotKind, SignalSlotPlan, TimerSlotPlan } from './car-page-plans'

const SHIFT_LIGHT_START_SHARE = 0.72
const SHIFT_LIGHT_STEP = 100
const UNPLACED = { col: 0, colSpan: 1, row: 0, rowSpan: 1, zOrder: 0 }

const DECIMALS_BY_RANGE: readonly { upTo: number; decimals: number }[] = [
  { upTo: 2, decimals: 2 },
  { upTo: 20, decimals: 1 },
]

const decimalsFor = (def: SignalDef): number =>
  DECIMALS_BY_RANGE.find(({ upTo }) => def.max - def.min <= upTo)?.decimals ?? 0

const sizeOf = (big: number | undefined): { big?: number } => (big === undefined ? {} : { big })

const gaugeConfig = (def: SignalDef, big: number | undefined): GaugeWidgetConfig => ({
  type: 'gauge',
  displayStyle: 'numeric',
  minValue: def.min,
  maxValue: def.max,
  dangerLevel: def.max,
  decimalPlaces: decimalsFor(def),
  ...sizeOf(big),
})

const shiftLightStart = (def: SignalDef): number =>
  Math.round(((def.dangerLevel ?? def.max) * SHIFT_LIGHT_START_SHARE) / SHIFT_LIGHT_STEP) *
  SHIFT_LIGHT_STEP

interface SignalKindSpec {
  claimsSignal: boolean
  config: (def: SignalDef, big: number | undefined) => Widget['config']
}

export const SIGNAL_KINDS: Record<SignalSlotKind, SignalKindSpec> = {
  gauge: { claimsSignal: true, config: gaugeConfig },
  barGauge: {
    claimsSignal: true,
    config: (def, big) => ({ ...gaugeConfig(def, big), showBar: true }),
  },
  revGauge: {
    claimsSignal: true,
    config: (def, big) => ({ ...gaugeConfig(def, big), revFlash: true }),
  },
  gear: {
    claimsSignal: true,
    config: (_def, big) => ({ type: 'gear', decimalPlaces: 0, ...sizeOf(big) }),
  },
  shiftLight: {
    claimsSignal: false,
    config: (def) => ({
      type: 'shift_light',
      startValue: shiftLightStart(def),
      redSegments: SHIFT_LIGHT_RED_SEGMENTS,
    }),
  },
}

const widgetOf = (id: string, signal: string, config: Widget['config']): Widget =>
  pairWidget({ id, signal, layout: { ...UNPLACED }, style: { ...NEW_WIDGET_STYLE } }, config)

export const signalWidget = (id: string, slot: SignalSlotPlan, def: SignalDef): Widget => {
  const spec = SIGNAL_KINDS[slot.kind]
  return widgetOf(id, def.name, spec.config(def, slot.big))
}

export const lapTimerWidget = (id: string, slot: TimerSlotPlan): Widget =>
  widgetOf(id, '', { type: 'timer', source: 'lap', ...sizeOf(slot.big) })
