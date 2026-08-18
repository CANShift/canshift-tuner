import { displayUnit, displayValue, type UnitSystem } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import type { LiveSample } from '../hooks/useLiveSampler'

const TIME_DECIMALS = 1
const NEEDS_QUOTES = /[",\n]/

const escapeCsv = (value: string): string =>
  NEEDS_QUOTES.test(value) ? `"${value.replace(/"/g, '""')}"` : value

const header = (signals: readonly SignalDef[], system: UnitSystem): string[] => [
  'seconds',
  ...signals.map((signal) => {
    const unit = displayUnit(signal.unit, system)
    return unit.length > 0 ? `${signal.name} (${unit})` : signal.name
  }),
]

export const buildLiveCsv = (
  signals: readonly SignalDef[],
  samples: readonly LiveSample[],
  system: UnitSystem
): string => {
  const rows = [
    header(signals, system),
    ...samples.map((sample) => [
      sample.t.toFixed(TIME_DECIMALS),
      ...signals.map((signal) => {
        const value = sample.values[signal.name]
        return value === undefined ? '' : String(displayValue(value, signal.unit, system))
      }),
    ]),
  ]
  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
}

export const liveCsvFilename = (stamp: string): string => `canshift-live-${stamp}.csv`
