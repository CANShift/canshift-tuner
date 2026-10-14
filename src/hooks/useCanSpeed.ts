import { useCallback, useEffect, useState } from 'react'
import type { CanSpeedKbps, DeviceConfig } from '@canshift/core'
import { DEFAULT_DEVICE_CONFIG } from '@canshift/core'
import { deviceConfigIpc } from '../transport'
import { transportErrorText } from '../transport/humanize-transport-error'
import { useDeviceStore } from '../stores/device.store'
import { useLogStore } from '../stores/log.store'
import { configOf, type CanSpeedState } from '../lib/can-speed'

export interface UseCanSpeed {
  state: CanSpeedState
  writeSpeed: (speed: CanSpeedKbps) => void
}

const readState = async (): Promise<CanSpeedState> => {
  const result = await deviceConfigIpc.read()
  if (!result.success) {
    return {
      kind: 'error',
      config: DEFAULT_DEVICE_CONFIG,
      message: transportErrorText(result.error),
    }
  }
  return { kind: 'ready', config: result.config ?? DEFAULT_DEVICE_CONFIG }
}

const writeState = async (config: DeviceConfig): Promise<CanSpeedState> => {
  const result = await deviceConfigIpc.write(config)
  if (result.success) return { kind: 'written', config }
  return { kind: 'error', config, message: transportErrorText(result.error) }
}

export const useCanSpeed = (): UseCanSpeed => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const log = useLogStore((s) => s.push)
  const linked = connected && !simulationMode
  const [state, setState] = useState<CanSpeedState>({ kind: 'offline' })

  useEffect(() => {
    if (!linked) {
      setState({ kind: 'offline' })
      return
    }
    let cancelled = false
    setState({ kind: 'reading' })
    void readState().then((next) => {
      if (!cancelled) setState(next)
    })
    return () => {
      cancelled = true
    }
  }, [linked])

  const writeSpeed = useCallback(
    (speed: CanSpeedKbps) => {
      if (!linked) return
      const config = { ...configOf(state), canSpeedKbps: speed }
      setState({ kind: 'writing', config })
      log('info', `Writing CAN bus speed ${String(speed)} kbit/s`)
      void writeState(config).then(setState)
    },
    [linked, state, log]
  )

  return { state, writeSpeed }
}
