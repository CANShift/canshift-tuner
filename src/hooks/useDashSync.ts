import { useEffect } from 'react'
import { deviceConfigIpc, deviceIpc } from '../transport'
import type { DeviceConfigResult } from '../transport/types'
import { transportErrorText } from '../transport/humanize-transport-error'
import { useDeviceStore } from '../stores/device.store'
import { useLogStore } from '../stores/log.store'
import { adoptDeviceConfig, adoptDeviceDashboard } from '../stores/sync/draft'

type Log = ReturnType<typeof useLogStore.getState>['push']

const ON_DASHBOARD: Record<
  DeviceConfigResult['kind'],
  (result: DeviceConfigResult, log: Log) => void
> = {
  ok: (result) => {
    if (result.kind === 'ok') adoptDeviceDashboard(result.config)
  },
  none: () => {
    adoptDeviceDashboard(null)
  },
  error: (result, log) => {
    if (result.kind === 'error') console.error('[sync] the dash setup is unreadable', result.error)
    log('error', `The dash setup could not be read: ${transportErrorText('fetch_failed')}`)
  },
}

const readDashboard = async (log: Log): Promise<void> => {
  const result = await deviceIpc.getConfig()
  ON_DASHBOARD[result.kind](result, log)
}

const readDeviceConfig = async (log: Log): Promise<void> => {
  const result = await deviceConfigIpc.read()
  if (result.success && result.config !== null) adoptDeviceConfig(result.config)
  if (!result.success) log('warn', `CAN bus speed unknown: ${transportErrorText(result.error)}`)
}

const readDash = async (log: Log): Promise<void> => {
  try {
    await readDashboard(log)
    await readDeviceConfig(log)
  } catch (err) {
    console.error('[sync] reading the dash threw', err)
    log('error', transportErrorText('fetch_failed'))
  }
}

export const useDashSync = (): void => {
  const connected = useDeviceStore((s) => s.connected)
  const transport = useDeviceStore((s) => s.transport)
  const simulation = useDeviceStore((s) => s.simulationMode)
  const log = useLogStore((s) => s.push)

  useEffect(() => {
    if (!connected || transport === null || simulation) return
    void readDash(log)
  }, [connected, transport, simulation, log])
}
