import type { ButtonAction, SensorIconName, Widget, WidgetType } from '@canshift/core'
import { SIZE_TOKENS } from '../utils/size-tokens'
import { createId } from '../utils/id'
import { DEFAULT_WIDGET_STYLE } from '../utils/default-widget'

export type PaletteWidgetType = WidgetType

export interface PaletteItem {
  type: PaletteWidgetType
  label: string
  icon: SensorIconName
  defaultSignal: string
  defaultColSpan: number
  defaultRowSpan: number
}

const GAUGE_MAX_RPM = 8_000
const GAUGE_DANGER_RPM = 7_000
const SHIFT_LIGHT_START_RPM = 3_000
const SHIFT_LIGHT_RED_SEGMENTS = 5
const WARNING_THRESHOLD_BAR = 1
const WIDGET_FONT_SIZE = 16

const DEFAULT_BUTTON_ACTION: ButtonAction = {
  category: 'device',
  type: 'timer_control',
  op: 'toggle',
}

type PaletteEntry = Omit<PaletteItem, 'type'> & { config: (item: PaletteItem) => Widget['config'] }

const LARGE = { defaultColSpan: SIZE_TOKENS.L.colSpan, defaultRowSpan: SIZE_TOKENS.L.rowSpan }

const PALETTE: Record<PaletteWidgetType, PaletteEntry> = {
  gauge: {
    label: 'Gauge',
    icon: 'rpm',
    defaultSignal: 'rpm',
    defaultColSpan: SIZE_TOKENS.XL.colSpan,
    defaultRowSpan: SIZE_TOKENS.XL.rowSpan,
    config: (item) => ({
      type: 'gauge',
      displayStyle: 'arc',
      minValue: 0,
      maxValue: GAUGE_MAX_RPM,
      dangerLevel: GAUGE_DANGER_RPM,
      decimalPlaces: 0,
      iconName: item.icon,
    }),
  },
  button: {
    label: 'Button',
    icon: 'cog',
    defaultSignal: '',
    ...LARGE,
    config: () => ({
      type: 'button',
      mode: 'single',
      label: 'Button',
      showLabel: true,
      actions: [DEFAULT_BUTTON_ACTION],
    }),
  },
  gear: {
    label: 'Gear',
    icon: 'gear',
    defaultSignal: 'gear',
    ...LARGE,
    config: () => ({ type: 'gear', decimalPlaces: 0 }),
  },
  shift_light: {
    label: 'Shift light',
    icon: 'rpm',
    defaultSignal: 'rpm',
    defaultColSpan: 12,
    defaultRowSpan: 1,
    config: () => ({
      type: 'shift_light',
      startValue: SHIFT_LIGHT_START_RPM,
      redSegments: SHIFT_LIGHT_RED_SEGMENTS,
    }),
  },
  warning: {
    label: 'Warning light',
    icon: 'warning',
    defaultSignal: 'oil_press_bar',
    ...LARGE,
    config: (item) => ({
      type: 'warning',
      threshold: WARNING_THRESHOLD_BAR,
      invertLogic: true,
      iconName: item.icon,
    }),
  },
  timer: {
    label: 'Lap timer',
    icon: 'timer',
    defaultSignal: '',
    ...LARGE,
    config: () => ({ type: 'timer', source: 'lap' }),
  },
  image: {
    label: 'Image',
    icon: 'cog',
    defaultSignal: '',
    ...LARGE,
    config: () => ({ type: 'image', imagePath: '' }),
  },
}

const toPaletteItem = ([type, { config: _config, ...item }]: [
  PaletteWidgetType,
  PaletteEntry,
]): PaletteItem => ({
  type,
  ...item,
})

export const PALETTE_ITEMS: readonly PaletteItem[] = (
  Object.entries(PALETTE) as [PaletteWidgetType, PaletteEntry][]
).map(toPaletteItem)

const configFor = (item: PaletteItem): Widget['config'] => PALETTE[item.type].config(item)

export const paletteItemFor = (type: PaletteWidgetType): PaletteItem | undefined =>
  PALETTE_ITEMS.find((item) => item.type === type)

export const retypeWidget = (widget: Widget, type: PaletteWidgetType): Partial<Widget> | null => {
  const item = paletteItemFor(type)
  if (item === undefined || widget.type === type) return null
  return {
    type,
    config: configFor(item),
    signal: item.defaultSignal.length > 0 ? widget.signal || item.defaultSignal : '',
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
