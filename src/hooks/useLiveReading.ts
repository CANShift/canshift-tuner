import { useSignalStore } from '../stores/signal.store'
import { formatSignalValue } from '../lib/format'
import { useDisplayUnits } from './useDisplayUnits'
import { useLiveSignals } from './useLiveSignals'

export interface LiveReading {
  text: string
  live: boolean
}

export const useLiveReadings = (): ((signal: string) => LiveReading) => {
  const values = useLiveSignals()
  const signals = useSignalStore((s) => s.signals)
  const units = useDisplayUnits()
  return (signal) => {
    const value = values[signal]
    const unit = signals.find((candidate) => candidate.name === signal)?.unit ?? ''
    if (value === undefined) return { text: '', live: false }
    const shown = formatSignalValue(units.valueOf(value, unit))
    return { text: `${shown} ${units.unitOf(unit)}`.trim(), live: true }
  }
}
