import { create } from 'zustand'
import { getDeviceLink } from '../transport/link'
import type { DeviceLink } from '../transport/device-link'
import type { SerialStatus } from '../transport/serial-events'
import { useDeviceStore } from './device.store'
import { errorMessage } from '../lib/error-message'

const NON_ERROR_CODES = new Set(['no_port_selected'])

const toReportableError = (error: string | null | undefined): string | null =>
  error !== undefined && error !== null && !NON_ERROR_CODES.has(error) ? error : null

interface ConnectionState {
  status: SerialStatus
  lastError: string | null
  notice: string | null

  connect: () => Promise<void>
  disconnect: () => void
  disconnectWithNotice: (notice: string) => void
  tryAutoReconnect: () => Promise<void>
}

type DeviceStatusSync = (link: DeviceLink, reportable: string | null) => void

const syncDeviceStore: Partial<Record<SerialStatus, DeviceStatusSync>> = {
  connected: (link) => {
    useDeviceStore.getState().setConnected(link.kind)
  },
  disconnected: (_link, reportable) => {
    const device = useDeviceStore.getState()
    if (device.connected || reportable !== null) device.setDisconnected(reportable)
  },
}

const followLinkStatus = (link: DeviceLink, set: (state: Partial<ConnectionState>) => void) => {
  const unsubscribe = link.onStatus((status, error) => {
    const reportable = toReportableError(error)
    set({ status, lastError: reportable })
    syncDeviceStore[status]?.(link, reportable)
  })
  import.meta.hot?.dispose(unsubscribe)
}

type SetConnection = (state: Partial<ConnectionState>) => void

const disconnectActions = (link: DeviceLink, set: SetConnection) => ({
  disconnect: () => {
    set({ notice: null })
    link.disconnect()
  },
  disconnectWithNotice: (notice: string) => {
    set({ notice })
    link.disconnect()
  },
})

export const useConnectionStore = create<ConnectionState>()((set) => {
  const link = getDeviceLink()
  followLinkStatus(link, set)

  return {
    status: link.getStatus(),
    lastError: null,
    notice: null,
    connect: async () => {
      set({ notice: null })
      try {
        await link.connect()
      } catch (err) {
        set({ lastError: toReportableError(errorMessage(err, 'connect_failed')) })
      }
    },
    ...disconnectActions(link, set),
    tryAutoReconnect: async () => {
      try {
        await link.autoConnect()
      } catch (err) {
        set({ lastError: errorMessage(err, 'auto_reconnect_failed') })
      }
    },
  }
})
