import { useEffect } from 'react'
import { useDeviceStore } from '../stores/device.store'
import { useLogStore } from '../stores/log.store'
import { usbService } from '../transport'
import { transportErrorText } from '../transport/humanize-transport-error'
import { HeartbeatTracker } from '../lib/heartbeat-tracker'
import { useLiveTransport } from './useLiveTransport'

const HEARTBEAT_INTERVAL_MS = 5_000

const reportUnresponsive = (missed: number, error: string) => {
  useLogStore
    .getState()
    .push(
      'error',
      `Firmware unresponsive — ${String(missed)} pings missed (${transportErrorText(error)})`
    )
}

const startHeartbeat = (): (() => void) => {
  const tracker = new HeartbeatTracker()
  let cancelled = false
  const probe = async () => {
    const result = await usbService.ping()
    if (cancelled) return
    const outcome = tracker.record(result, Date.now())
    if (outcome.liveness) useDeviceStore.getState().setFirmwareLiveness(outcome.liveness)
    if (outcome.reportUnresponsive && result.kind === 'error')
      reportUnresponsive(tracker.missedPings(), result.error)
  }
  void probe()
  const id = window.setInterval(() => void probe(), HEARTBEAT_INTERVAL_MS)
  return () => {
    cancelled = true
    window.clearInterval(id)
  }
}

export const useHeartbeat = (): void => {
  const transport = useLiveTransport()
  const setFirmwareLiveness = useDeviceStore((s) => s.setFirmwareLiveness)

  useEffect(() => {
    if (transport === null) {
      setFirmwareLiveness({ kind: 'unknown' })
      return
    }
    const stop = startHeartbeat()
    return () => {
      stop()
      setFirmwareLiveness({ kind: 'unknown' })
    }
  }, [transport, setFirmwareLiveness])
}
