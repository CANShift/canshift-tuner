import type { CriticalAlert, CriticalAlertDirection, SignalDef } from '@canshift/core'
import { signalDisplayLabel } from '@canshift/core'

type AlertLevels = Pick<
  SignalDef,
  'name' | 'max' | 'warningLevel' | 'dangerLevel' | 'highDangerLevel'
>

const fallsIntoDanger = (signal: AlertLevels): boolean =>
  signal.highDangerLevel === undefined &&
  signal.warningLevel !== undefined &&
  signal.dangerLevel !== undefined &&
  signal.warningLevel > signal.dangerLevel

export const defaultCriticalAlert = (signal: AlertLevels): CriticalAlert => {
  const direction: CriticalAlertDirection = fallsIntoDanger(signal) ? 'below' : 'above'
  return {
    signal: signal.name,
    firesAt: signal.highDangerLevel ?? signal.dangerLevel ?? signal.max,
    direction,
    acknowledgeOn: 'dash',
  }
}

export const describeCriticalRule = (
  alert: CriticalAlert,
  shownFiresAt: string,
  unit: string
): string => [alert.direction, shownFiresAt, unit].filter((part) => part.length > 0).join(' ')

export interface TakeoverText {
  name: string
  value: string
  rule: string
}

export const takeoverTextFor = (
  alert: CriticalAlert,
  shownFiresAt: number,
  unit: string
): TakeoverText => {
  const value = String(shownFiresAt)
  return {
    name: signalDisplayLabel(alert.signal),
    value,
    rule: describeCriticalRule(alert, value, unit),
  }
}
