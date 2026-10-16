import type { SignalDef } from '@canshift/core'

export interface SignalRow {
  signal: SignalDef
  value: number | undefined
  live: boolean
}

const problemsFirst = (a: SignalRow, b: SignalRow): number => Number(a.live) - Number(b.live)

export const signalRows = (
  signals: readonly SignalDef[],
  values: Readonly<Record<string, number>>
): SignalRow[] =>
  signals
    .map((signal) => {
      const value = values[signal.name]
      return { signal, value, live: value !== undefined }
    })
    .sort(problemsFirst)

export const liveCount = (rows: readonly SignalRow[]): number =>
  rows.filter((row) => row.live).length
