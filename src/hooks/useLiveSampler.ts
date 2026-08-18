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

export const useLiveSampler = (
  values: Record<string, number>,
  windowSeconds: number
): LiveSampler => {
  const valuesRef = useRef(values)
  valuesRef.current = values

  const [history, setHistory] = useState<LiveSample[]>([])
  const [recording, setRecording] = useState(false)
  const [recordedCount, setRecordedCount] = useState(0)
  const recordedRef = useRef<LiveSample[]>([])
  const recordingRef = useRef(false)
  recordingRef.current = recording

  useEffect(() => {
    const started = performance.now()
    const timer = setInterval(() => {
      const sample: LiveSample = {
        t: (performance.now() - started) / 1_000,
        values: { ...valuesRef.current },
      }
      setHistory((previous) => {
        const next = [...previous, sample]
        const cutoff = sample.t - WINDOW_MAX_S
        const first = next.findIndex((entry) => entry.t >= cutoff)
        return first > 0 ? next.slice(first) : next
      })
      if (recordingRef.current) {
        recordedRef.current.push(sample)
        setRecordedCount(recordedRef.current.length)
      }
    }, SAMPLE_INTERVAL_MS)
    return () => {
      clearInterval(timer)
    }
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

  const latest = history[history.length - 1]?.t ?? 0
  const windowed = history.filter((entry) => entry.t >= latest - windowSeconds)

  return { history: windowed, recording, recordedCount, startRecording, stopRecording }
}
