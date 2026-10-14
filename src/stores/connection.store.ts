import { create } from 'zustand'
import { getDeviceLink } from '../transport/link'
import type { SerialStatus } from '../transport/serial-events'
import { useDeviceStore } from './device.store'
import { errorMessage } from '../lib/error-message'

const NON_ERROR_CODES = new Set(['no_port_selected'])

const toReportableError = (error: string | null | undefined): string | null =>
  error !== undefined && error !== null && !NON_ERROR_CODES.has(error) ? error : null

interface ConnectionState {
  status: SerialStatus
  lastError: string | null

  connect: () => Promise<void>
  disconnect: () => void
  tryAutoReconnect: () => Promise<void>
}

export const useConnectionStore = create<ConnectionState>()((set) => {
  const client = getDeviceLink()

  const unsubscribeStatus = client.onStatus((status, error) => {
    const reportable = toReportableError(error)
    set({ status, lastError: reportable })
    if (status === 'connected') {
      useDeviceStore.getState().setConnected(client.kind)
    } else if (status === 'disconnected') {
      const device = useDeviceStore.getState()
      if (device.connected || reportable) {
        device.setDisconnected(reportable)
      }
    }
  })

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      unsubscribeStatus()
    })
  }

  return {
    status: client.getStatus(),
    lastError: null,

    connect: async () => {
      try {
        await client.connect()
      } catch (err) {
        const msg = errorMessage(err, 'connect_failed')
        set({ lastError: toReportableError(msg) })
      }
    },

    disconnect: () => {
      client.disconnect()
    },

    tryAutoReconnect: async () => {
      try {
        await client.autoConnect()
      } catch (err) {
        const msg = errorMessage(err, 'auto_reconnect_failed')
        set({ lastError: msg })
      }
    },
  }
})
