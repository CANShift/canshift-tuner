import { hasUnitPair, type SignalDef } from '@canshift/core'
import type { StatusItem } from './status-row'

export type ValueStatusItem = Extract<StatusItem, { type: 'signal' | 'signalMax' }>

export const declaredUnitOf = (signals: readonly SignalDef[], signal: string): string =>
  signals.find((def) => def.name === signal)?.unit ?? ''

export const canConvert = (unit: string): boolean => unit !== '' && hasUnitPair(unit)

const withoutUnit = (item: ValueStatusItem): ValueStatusItem => {
  const { unit: _unit, showUnit: _showUnit, ...rest } = item
  return rest
}

export const withConversion = (
  item: ValueStatusItem,
  convert: boolean,
  declaredUnit: string
): ValueStatusItem =>
  convert && canConvert(declaredUnit) ? { ...item, unit: declaredUnit } : withoutUnit(item)

export const withSignal = (
  item: ValueStatusItem,
  signal: string,
  declaredUnit: string
): ValueStatusItem => withConversion({ ...item, signal }, item.unit !== undefined, declaredUnit)

export const withShowUnit = (item: ValueStatusItem, showUnit: boolean): ValueStatusItem => {
  if (showUnit) return { ...item, showUnit }
  const { showUnit: _dropped, ...rest } = item
  return rest
}
