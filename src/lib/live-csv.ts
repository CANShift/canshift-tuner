import type { SignalDef } from '@canshift/core'
import type { LiveSample } from '../hooks/useLiveSampler'

const TIME_DECIMALS = 1
const NEEDS_QUOTES = /[",\n]/

const escapeCsv = (value: string): string =>
  NEEDS_QUOTES.test(value) ? `"${value.replace(/"/g, '""')}"` : value

const header = (signals: readonly SignalDef[]): string[] => [
  'seconds',
  ...signals.map((signal) =>
    signal.unit.length > 0 ? `${signal.name} (${signal.unit})` : signal.name
  ),
]

export const buildLiveCsv = (
  signals: readonly SignalDef[],
  samples: readonly LiveSample[]
): string => {
  const rows = [
    header(signals),
    ...samples.map((sample) => [
      sample.t.toFixed(TIME_DECIMALS),
      ...signals.map((signal) => {
        const value = sample.values[signal.name]
        return value === undefined ? '' : String(value)
      }),
    ]),
  ]
  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
}

export const liveCsvFilename = (stamp: string): string => `canshift-live-${stamp}.csv`
