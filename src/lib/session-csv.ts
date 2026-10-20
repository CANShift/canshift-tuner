import type { SignalDef, UnitSystem } from '@canshift/core'
import type { DatalogLap, DatalogSession } from '@canshift/core/wire'
import type { LiveSample } from '../hooks/useLiveSampler'
import { buildLiveCsv, type CsvColumn } from './live-csv'

const LAP_COLUMN: CsvColumn = { name: 'lap', unit: '' }
const MS_PER_S = 1_000
const TIME_DECIMALS = 2
const SESSION_EXTENSION = /\.csl$/i
const FLOAT32_DIGITS = 7

const lapsStartedBy = (laps: readonly DatalogLap[], tMs: number): number =>
  laps.filter((lap) => lap.tMs <= tMs).length

const recordedPrecision = (values: Record<string, number>): Record<string, number> =>
  Object.fromEntries(
    Object.entries(values).map(([name, value]) => [name, Number(value.toPrecision(FLOAT32_DIGITS))])
  )

const toSamples = (session: DatalogSession): LiveSample[] =>
  session.samples.map((sample) => {
    const values = recordedPrecision(sample.values)
    const withLap =
      session.laps.length > 0
        ? { [LAP_COLUMN.name]: lapsStartedBy(session.laps, sample.tMs) + 1, ...values }
        : values
    return { t: sample.tMs / MS_PER_S, values: withLap }
  })

const recordedColumns = (session: DatalogSession, known: readonly SignalDef[]): CsvColumn[] => {
  const recorded = new Set(session.samples.flatMap((sample) => Object.keys(sample.values)))
  const units = new Map(known.map((signal) => [signal.name, signal.unit]))
  return session.header.signals
    .filter((signal) => recorded.has(signal.name))
    .map((signal) => ({ name: signal.name, unit: units.get(signal.name) ?? '' }))
}

export const buildSessionCsv = (
  session: DatalogSession,
  known: readonly SignalDef[],
  system: UnitSystem
): string => {
  const lapColumns = session.laps.length > 0 ? [LAP_COLUMN] : []
  const columns = [...lapColumns, ...recordedColumns(session, known)]
  return buildLiveCsv(columns, toSamples(session), system, TIME_DECIMALS)
}

export const sessionCsvFilename = (logName: string): string =>
  logName.replace(SESSION_EXTENSION, '.csv')
