import { useState } from 'react'
import type { SignalDef } from '@canshift/core'
import { WINDOW_MAX_S, WINDOW_MIN_S, WINDOW_STEP_S, type LiveSampler } from './useLiveSampler'
import type { DisplayUnits } from './useDisplayUnits'
import { buildLiveCsv, liveCsvFilename } from '../lib/live-csv'
import { downloadFile } from '../lib/download'

const DEFAULT_WINDOW_S = 30
const CSV_MIME = 'text/csv;charset=utf-8'

export const usePausableValues = (live: Record<string, number>) => {
  const [paused, setPaused] = useState(false)
  const [frozen, setFrozen] = useState<Record<string, number>>({})
  const togglePause = () => {
    setFrozen(live)
    setPaused((on) => !on)
  }
  return { values: paused ? frozen : live, paused, togglePause }
}

export const useSignalSelection = () => {
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (name: string) => {
    setSelected((current) =>
      current.includes(name) ? current.filter((entry) => entry !== name) : [...current, name]
    )
  }
  return { selected, toggle }
}

const clampWindow = (seconds: number): number =>
  Math.min(WINDOW_MAX_S, Math.max(WINDOW_MIN_S, seconds))

export const useTimeWindow = () => {
  const [windowSeconds, setWindowSeconds] = useState(DEFAULT_WINDOW_S)
  const stepWindow = (direction: 1 | -1) => {
    setWindowSeconds((current) => clampWindow(current - direction * WINDOW_STEP_S))
  }
  return { windowSeconds, stepWindow }
}

export const saveRecording = (
  sampler: LiveSampler,
  signals: readonly SignalDef[],
  units: DisplayUnits
): void => {
  const samples = sampler.stopRecording()
  if (samples.length === 0) return
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  downloadFile(liveCsvFilename(stamp), CSV_MIME, buildLiveCsv(signals, samples, units.system))
}
