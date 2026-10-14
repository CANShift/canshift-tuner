import type { SignalDef } from '@canshift/core'
import { useDisplayUnits } from './useDisplayUnits'
import { useLiveSignals } from './useLiveSignals'
import { useLiveSampler, type LiveSample } from './useLiveSampler'
import { saveRecording, usePausableValues, useTimeWindow } from './useLiveView'

export interface LiveSession {
  values: Record<string, number>
  history: readonly LiveSample[]
  paused: boolean
  togglePause: () => void
  recording: boolean
  recordedCount: number
  toggleRecording: () => void
  windowSeconds: number
  stepWindow: (direction: 1 | -1) => void
}

export const useLiveSession = (signals: readonly SignalDef[]): LiveSession => {
  const { values, paused, togglePause } = usePausableValues(useLiveSignals())
  const { windowSeconds, stepWindow } = useTimeWindow()
  const sampler = useLiveSampler(values, windowSeconds)
  const units = useDisplayUnits()
  const saveAndStop = () => {
    saveRecording(sampler, signals, units)
  }
  return {
    values,
    history: sampler.history,
    paused,
    togglePause,
    recording: sampler.recording,
    recordedCount: sampler.recordedCount,
    toggleRecording: sampler.recording ? saveAndStop : sampler.startRecording,
    windowSeconds,
    stepWindow,
  }
}
