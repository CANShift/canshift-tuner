import { useConnectionStore } from '../stores/connection.store'
import { useDeviceStore } from '../stores/device.store'
import type { SerialStatus } from '../transport/serial-events'

export type Connection = 'connected' | 'reconnecting' | 'offline'

const FROM_LINK: Record<SerialStatus, Connection> = {
  connected: 'connected',
  connecting: 'reconnecting',
  reconnecting: 'reconnecting',
  disconnected: 'offline',
}

export interface ConnectionView {
  connection: Connection
  anotherDevice: boolean
  editingOffline: boolean
}

export const useConnection = (): ConnectionView => {
  const status = useConnectionStore((s) => s.status)
  const lastError = useConnectionStore((s) => s.lastError)
  const editingOffline = useDeviceStore((s) => s.simulationMode)
  return {
    connection: editingOffline ? 'offline' : FROM_LINK[status],
    anotherDevice: status === 'disconnected' && lastError === 'replaced',
    editingOffline,
  }
}
