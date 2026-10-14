import { useCallback, useEffect, useRef, useState } from 'react'

export const SAMPLE_INTERVAL_MS = 100
export const WINDOW_MIN_S = 5
export const WINDOW_MAX_S = 120
export const WINDOW_STEP_S = 5

export interface LiveSample {
  t: number
  values: Record<string, number>
}

export interface LiveSampler {
  history: LiveSample[]
  recording: boolean
  recordedCount: number
  startRecording: () => void
  stopRecording: () => LiveSample[]
}

const MS_PER_S = 1_000

export const appendSample = (history: readonly LiveSample[], sample: LiveSample): LiveSample[] => {
  const next = [...history, sample]
  const cutoff = sample.t - WINDOW_MAX_S
  const first = next.findIndex((entry) => entry.t >= cutoff)
  return first > 0 ? next.slice(first) : next
}

export const lastSeconds = (history: readonly LiveSample[], seconds: number): LiveSample[] => {
  const latest = history[history.length - 1]?.t ?? 0
  return history.filter((entry) => entry.t >= latest - seconds)
}

interface Recorder {
  recording: boolean
  recordedCount: number
  record: (sample: LiveSample) => void
  startRecording: () => void
  stopRecording: () => LiveSample[]
}

const useRecorder = (): Recorder => {
  const [recording, setRecording] = useState(false)
  const [recordedCount, setRecordedCount] = useState(0)
  const recordedRef = useRef<LiveSample[]>([])
  const recordingRef = useRef(false)
  recordingRef.current = recording

  const record = useCallback((sample: LiveSample) => {
    if (!recordingRef.current) return
    recordedRef.current.push(sample)
    setRecordedCount(recordedRef.current.length)
  }, [])
  const startRecording = useCallback(() => {
    recordedRef.current = []
    setRecordedCount(0)
    setRecording(true)
  }, [])
  const stopRecording = useCallback((): LiveSample[] => {
    setRecording(false)
    return recordedRef.current
  }, [])
  return { recording, recordedCount, record, startRecording, stopRecording }
}

export const useLiveSampler = (
  values: Record<string, number>,
  windowSeconds: number
): LiveSampler => {
  const valuesRef = useRef(values)
  valuesRef.current = values
  const [history, setHistory] = useState<LiveSample[]>([])
  const { record, ...recorder } = useRecorder()

  useEffect(() => {
    const started = performance.now()
    const timer = setInterval(() => {
      const sample: LiveSample = {
        t: (performance.now() - started) / MS_PER_S,
        values: { ...valuesRef.current },
      }
      setHistory((previous) => appendSample(previous, sample))
      record(sample)
    }, SAMPLE_INTERVAL_MS)
    return () => {
      clearInterval(timer)
    }
  }, [record])

  return { history: lastSeconds(history, windowSeconds), ...recorder }
}
