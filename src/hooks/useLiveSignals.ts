import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { SignalDef } from '@canshift/core'
import { useSignalStore } from '../stores/signal.store'
import { useDeviceStore } from '../stores/device.store'
import { deviceEvents } from '../transport'
import { simulatedValues } from '../lib/simulated-values'

const LIVE_SIGNAL_THROTTLE_MS = 100
const MS_PER_S = 1000

type SetValues = Dispatch<SetStateAction<Record<string, number>>>

const animateSimulation = (signals: readonly SignalDef[], setValues: SetValues): (() => void) => {
  const started = Date.now()
  let frame = 0
  const tick = () => {
    setValues(simulatedValues(signals, (Date.now() - started) / MS_PER_S))
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(frame)
  }
}

const followDevice = (setValues: SetValues): (() => void) => {
  let lastCommit = 0
  return deviceEvents.onSignal((payload) => {
    const now = performance.now()
    if (now - lastCommit < LIVE_SIGNAL_THROTTLE_MS) return
    lastCommit = now
    setValues(payload)
  })
}

export const useLiveSignals = (): Record<string, number> => {
  const signals = useSignalStore((s) => s.signals)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const [values, setValues] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!simulationMode || signals.length === 0) {
      setValues({})
      return
    }
    return animateSimulation(signals, setValues)
  }, [signals, simulationMode])

  useEffect(() => {
    if (!connected || simulationMode) return
    setValues({})
    return followDevice(setValues)
  }, [connected, simulationMode])

  return values
}
