import { useEffect, useState } from 'react'
import { deviceEvents } from '../transport'
import { useDeviceStore } from '../stores/device.store'

const SILENCE_THRESHOLD_MS = 6000
const TICK_MS = 1000

export interface BusSilence {
  silent: boolean
  elapsedSeconds: number
}

const QUIET: BusSilence = { silent: false, elapsedSeconds: 0 }

const subscribeToBusTraffic = (markTraffic: () => void): (() => void) => {
  const unsubscribers = [
    deviceEvents.onCanFrame(markTraffic),
    deviceEvents.onSignal(markTraffic),
    deviceEvents.onCanHealth(({ fps }) => {
      if (fps > 0) markTraffic()
    }),
  ]
  return () => {
    unsubscribers.forEach((unsubscribe) => {
      unsubscribe()
    })
  }
}

const nextSilence = (elapsedMs: number): BusSilence =>
  elapsedMs >= SILENCE_THRESHOLD_MS
    ? { silent: true, elapsedSeconds: Math.floor(elapsedMs / 1000) }
    : QUIET

const sameSilence = (a: BusSilence, b: BusSilence): boolean =>
  a.silent === b.silent && a.elapsedSeconds === b.elapsedSeconds

export const useBusSilence = (): BusSilence => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const [silence, setSilence] = useState<BusSilence>(QUIET)

  useEffect(() => {
    setSilence(QUIET)
    if (!connected || simulationMode) return

    let lastTrafficAt = Date.now()
    const unsubscribe = subscribeToBusTraffic(() => {
      lastTrafficAt = Date.now()
    })
    const timer = setInterval(() => {
      const candidate = nextSilence(Date.now() - lastTrafficAt)
      setSilence((previous) => (sameSilence(previous, candidate) ? previous : candidate))
    }, TICK_MS)

    return () => {
      clearInterval(timer)
      unsubscribe()
    }
  }, [connected, simulationMode])

  return silence
}
