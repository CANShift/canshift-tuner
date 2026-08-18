import type { SensorIconName, Widget, WidgetType } from '@canshift/core'
import { SIZE_TOKENS } from '../utils/size-tokens'
import { createId } from '../utils/id'
import { DEFAULT_WIDGET_STYLE } from '../utils/default-widget'

export type PaletteWidgetType = Extract<WidgetType, 'gauge' | 'button' | 'gear' | 'shift_light'>

export interface PaletteItem {
  type: PaletteWidgetType
  label: string
  icon: SensorIconName
  defaultSignal: string
  defaultColSpan: number
  defaultRowSpan: number
}

export const PALETTE_ITEMS: readonly PaletteItem[] = [
  {
    type: 'gauge',
    label: 'Gauge',
    icon: 'rpm',
    defaultSignal: 'rpm',
    defaultColSpan: SIZE_TOKENS.XL.colSpan,
    defaultRowSpan: SIZE_TOKENS.XL.rowSpan,
  },
  {
    type: 'button',
    label: 'Button',
    icon: 'cog',
    defaultSignal: '',
    defaultColSpan: SIZE_TOKENS.L.colSpan,
    defaultRowSpan: SIZE_TOKENS.L.rowSpan,
  },
  {
    type: 'gear',
    label: 'Gear',
    icon: 'gear',
    defaultSignal: 'gear',
    defaultColSpan: SIZE_TOKENS.L.colSpan,
    defaultRowSpan: SIZE_TOKENS.L.rowSpan,
  },
  {
    type: 'shift_light',
    label: 'Shift light',
    icon: 'rpm',
    defaultSignal: 'rpm',
    defaultColSpan: 12,
    defaultRowSpan: 1,
  },
]

const GAUGE_MAX_RPM = 8_000
const GAUGE_DANGER_RPM = 7_000
const SHIFT_LIGHT_START_RPM = 3_000
const SHIFT_LIGHT_RED_SEGMENTS = 5
const WIDGET_FONT_SIZE = 16

const configFor = (item: PaletteItem): Widget['config'] => {
  switch (item.type) {
    case 'gauge':
      return {
        type: 'gauge',
        displayStyle: 'arc',
        minValue: 0,
        maxValue: GAUGE_MAX_RPM,
        dangerLevel: GAUGE_DANGER_RPM,
        decimalPlaces: 0,
        iconName: item.icon,
      }
    case 'button':
      return { type: 'button', mode: 'single', label: 'Button', showLabel: true, actions: [] }
    case 'gear':
      return { type: 'gear', decimalPlaces: 0 }
    case 'shift_light':
      return {
        type: 'shift_light',
        startValue: SHIFT_LIGHT_START_RPM,
        redSegments: SHIFT_LIGHT_RED_SEGMENTS,
      }
  }
}

export const buildWidget = (item: PaletteItem): Widget => ({
  id: createId(item.type),
  type: item.type,
  signal: item.defaultSignal,
  layout: {
    col: 0,
    colSpan: item.defaultColSpan,
    row: 0,
    rowSpan: item.defaultRowSpan,
    zOrder: 0,
  },
  style: { ...DEFAULT_WIDGET_STYLE, fontSize: WIDGET_FONT_SIZE },
  config: configFor(item),
})

export const DEFAULT_NEW_WIDGET = PALETTE_ITEMS[0] as PaletteItem
