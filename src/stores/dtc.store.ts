import { create } from 'zustand'
import { dtcIpc } from '../transport/dtc-ipc'
import type { DtcReadResult } from '../transport/dtc-ipc'
import { useDeviceStore } from './device.store'

export const SIMULATED_DTCS = ['P0301', 'P0420', 'C1234', 'U0100']

export type DtcStatus = 'idle' | 'reading' | 'clearing'

interface DtcData {
  codes: string[]
  hasRead: boolean
  status: DtcStatus
  error: string | null
}

interface DtcState extends DtcData {
  read: () => Promise<void>
  clear: () => Promise<void>
}

const isSimulation = (): boolean => useDeviceStore.getState().simulationMode

const readOutcome = (result: DtcReadResult): Partial<DtcData> =>
  result.ok
    ? { codes: result.codes, hasRead: true, status: 'idle' }
    : { status: 'idle', error: result.error ?? 'read_failed' }

const rereadOutcome = (result: DtcReadResult): Partial<DtcData> =>
  result.ok ? readOutcome(result) : { ...readOutcome(result), codes: [], hasRead: true }

const readFromDevice = async (): Promise<Partial<DtcData>> => {
  if (isSimulation()) return { codes: SIMULATED_DTCS, hasRead: true, status: 'idle' }
  return readOutcome(await dtcIpc.read())
}

const clearOnDevice = async (): Promise<Partial<DtcData>> => {
  if (isSimulation()) return { codes: [], hasRead: true, status: 'idle' }
  const cleared = await dtcIpc.clear()
  if (!cleared.ok) return { status: 'idle', error: cleared.error ?? 'clear_failed' }
  return rereadOutcome(await dtcIpc.read())
}

export const useDtcStore = create<DtcState>()((set) => ({
  codes: [],
  hasRead: false,
  status: 'idle',
  error: null,

  read: async () => {
    set({ status: 'reading', error: null })
    set(await readFromDevice())
  },

  clear: async () => {
    set({ status: 'clearing', error: null })
    set(await clearOnDevice())
  },
}))
