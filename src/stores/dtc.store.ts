import { create } from 'zustand'
import { dtcIpc } from '../transport/dtc-ipc'
import { useDeviceStore } from './device.store'

export const SIMULATED_DTCS = ['P0301', 'P0420', 'C1234', 'U0100']

export type DtcStatus = 'idle' | 'reading' | 'clearing'

interface DtcState {
  codes: string[]
  hasRead: boolean
  status: DtcStatus
  error: string | null
  read: () => Promise<void>
  clear: () => Promise<void>
}

const isSimulation = (): boolean => useDeviceStore.getState().simulationMode

export const useDtcStore = create<DtcState>()((set) => ({
  codes: [],
  hasRead: false,
  status: 'idle',
  error: null,

  read: async () => {
    set({ status: 'reading', error: null })
    if (isSimulation()) {
      set({ codes: SIMULATED_DTCS, hasRead: true, status: 'idle' })
      return
    }
    const result = await dtcIpc.read()
    if (result.ok) set({ codes: result.codes, hasRead: true, status: 'idle' })
    else set({ status: 'idle', error: result.error ?? 'read_failed' })
  },

  clear: async () => {
    set({ status: 'clearing', error: null })
    if (isSimulation()) {
      set({ codes: [], hasRead: true, status: 'idle' })
      return
    }
    const cleared = await dtcIpc.clear()
    if (!cleared.ok) {
      set({ status: 'idle', error: cleared.error ?? 'clear_failed' })
      return
    }
    const reread = await dtcIpc.read()
    if (reread.ok) set({ codes: reread.codes, hasRead: true, status: 'idle' })
    else set({ codes: [], hasRead: true, status: 'idle', error: reread.error ?? 'read_failed' })
  },
}))
