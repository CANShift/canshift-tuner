import {
  BUILT_IN_ALERT_SIGNALS,
  type BuiltInAlertSource,
  type CriticalAlertDirection,
  type SignalDef,
} from '@canshift/core'

export interface AlertRule {
  direction: CriticalAlertDirection
  value: number
}

export interface BuiltInAlertLimit {
  source: BuiltInAlertSource
  signal: string
  unit: string
  rules: AlertRule[]
}

interface DashReading {
  danger: CriticalAlertDirection
  readsHighDanger: boolean
}

const DASH_READING: Record<BuiltInAlertSource, DashReading> = {
  oil_pressure: { danger: 'below', readsHighDanger: true },
  coolant_temp: { danger: 'above', readsHighDanger: true },
  oil_temp: { danger: 'above', readsHighDanger: true },
  battery_voltage: { danger: 'below', readsHighDanger: true },
  exhaust_temp: { danger: 'above', readsHighDanger: false },
  gearbox_temp: { danger: 'above', readsHighDanger: false },
  diff_temp: { danger: 'above', readsHighDanger: false },
}

const FIRES_FIRST: Record<CriticalAlertDirection, (a: number, b: number) => number> = {
  above: (a, b) => Math.min(a, b),
  below: (a, b) => Math.max(a, b),
}

type Levels = Pick<SignalDef, 'dangerLevel' | 'highDangerLevel'>

const candidates = (source: BuiltInAlertSource, levels: Levels): AlertRule[] => {
  const reading = DASH_READING[source]
  const high = reading.readsHighDanger ? levels.highDangerLevel : undefined
  return [
    { direction: reading.danger, value: levels.dangerLevel },
    { direction: 'above' as const, value: high },
  ].filter((rule): rule is AlertRule => rule.value !== undefined && Number.isFinite(rule.value))
}

const firstToFire = (rules: AlertRule[], direction: CriticalAlertDirection): AlertRule[] => {
  const values = rules.filter((rule) => rule.direction === direction).map((rule) => rule.value)
  return values.length === 0 ? [] : [{ direction, value: values.reduce(FIRES_FIRST[direction]) }]
}

export const dashRulesFor = (source: BuiltInAlertSource, levels: Levels): AlertRule[] => {
  const rules = candidates(source, levels)
  return [...firstToFire(rules, 'below'), ...firstToFire(rules, 'above')]
}

const BUILT_IN_SOURCES = Object.keys(BUILT_IN_ALERT_SIGNALS) as BuiltInAlertSource[]

export const builtInAlertLimits = (signals: readonly SignalDef[]): BuiltInAlertLimit[] =>
  BUILT_IN_SOURCES.map((source) => {
    const signal = BUILT_IN_ALERT_SIGNALS[source]
    const def = signals.find((candidate) => candidate.name === signal)
    return {
      source,
      signal,
      unit: def?.unit ?? '',
      rules: def === undefined ? [] : dashRulesFor(source, def),
    }
  })
