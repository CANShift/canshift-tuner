import { useEffect, useRef } from 'react'
import type { SignalDef } from '@canshift/core'
import { useDisplayUnits } from './useDisplayUnits'
import { useLiveSignals } from './useLiveSignals'
import { recordingFull, useLiveSampler, type LiveSample, type LiveSampler } from './useLiveSampler'
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

const useSaveWhenDone = (sampler: LiveSampler, save: () => void): void => {
  const latest = useRef({ recording: sampler.recording, save })
  latest.current = { recording: sampler.recording, save }
  const full = recordingFull(sampler.recordedCount)
  useEffect(() => {
    if (full) latest.current.save()
  }, [full])
  useEffect(
    () => () => {
      if (latest.current.recording) latest.current.save()
    },
    []
  )
}

export const useLiveSession = (signals: readonly SignalDef[]): LiveSession => {
  const { values, paused, togglePause } = usePausableValues(useLiveSignals())
  const { windowSeconds, stepWindow } = useTimeWindow()
  const sampler = useLiveSampler(values, windowSeconds)
  const units = useDisplayUnits()
  const saveAndStop = () => {
    saveRecording(sampler, signals, units)
  }
  useSaveWhenDone(sampler, saveAndStop)
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
