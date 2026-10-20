import {
  displayDecimals,
  displayUnit,
  displayValue,
  type TopBarItem,
  type UnitSystem,
} from '@canshift/core'
import { timerDemoValue } from './timer-source'

const PREVIEW_SIGNAL_VALUES: Record<string, number> = {
  battery_volts: 12.4,
  rpm: 3500,
  speed_kph: 80,
  coolant_temp_c: 88,
  oil_press_bar: 4.2,
  oil_temp_c: 95,
  map_number: 1,
  trip_km: 128,
  boost_bar: 1.61,
}

const PREVIEW_STALE = '--'

type ValueItem = Extract<TopBarItem, { type: 'signal' | 'signalMax' }>

type TextItem = Extract<TopBarItem, { type: 'signal' | 'signalMax' | 'timer' | 'flagWord' }>

const DEFAULT_DECIMALS = 1

interface PreviewNumber {
  value: number
  unit: string
  units: UnitSystem
}

const formatNumber = (
  { value, unit, units }: PreviewNumber,
  format: string | undefined
): string => {
  const shown = displayValue(value, unit, units)
  const m = /^(.*?)%\.(\d+)f(.*)$/.exec(format ?? '')
  const decimals = m ? parseInt(m[2] ?? '1', 10) : DEFAULT_DECIMALS
  const number = shown.toFixed(displayDecimals(decimals, unit, units))
  if (!format) return number
  if (!m) return format.replace('%f', number)
  return `${m[1] ?? ''}${number}${m[3] ?? ''}`
}

const valueText = (item: ValueItem, units: UnitSystem): string => {
  const raw = PREVIEW_SIGNAL_VALUES[item.signal]
  if (raw === undefined) return PREVIEW_STALE
  const unit = item.unit ?? ''
  const number = formatNumber({ value: raw, unit, units }, item.format)
  return item.showUnit && unit !== '' ? `${number} ${displayUnit(unit, units)}` : number
}

const withPrefix = (prefix: string | undefined, value: string): string =>
  prefix ? `${prefix} ${value}` : value

const TEXT: {
  [K in TextItem['type']]: (item: Extract<TextItem, { type: K }>, units: UnitSystem) => string
} = {
  signal: (item, units) => valueText(item, units),
  signalMax: (item, units) => withPrefix(item.text, valueText(item, units)),
  timer: (item) => withPrefix(item.text, timerDemoValue(item.source, undefined)),
  flagWord: (item) => item.text,
}

export const previewItemText = <T extends TextItem>(item: T, units: UnitSystem): string =>
  (TEXT[item.type] as (item: T, units: UnitSystem) => string)(item, units)
