import type { LinkKind } from '../transport/device-link'
import { create, type StoreApi } from 'zustand'
import { readItem, writeItem, STORAGE_KEYS } from '../lib/local-storage'

export type ConnectionStatus = 'disconnected' | 'connected' | 'burning' | 'error'

export type Transport = LinkKind

export type FirmwareCompat =
  | { kind: 'unknown' }
  | { kind: 'compatible'; protocol: number }
  | { kind: 'mismatch'; expected: number; got: number; version: string }

export type FirmwareLiveness =
  | { kind: 'unknown' }
  | { kind: 'alive'; lastPongAt: number; uptimeMs: number | null }
  | { kind: 'unresponsive'; missedPings: number; sinceMs: number }

export interface HeapStatsEntry {
  tsMs: number
  freeInternal: number
  largestInternal: number
  freePsram: number | null
  largestPsram: number | null
  receivedAt: number
}

export const HEAP_STATS_RING_CAP = 360

interface DeviceData {
  status: ConnectionStatus
  transport: Transport | null
  firmwareVersion: string | null
  boardId: string | null
  lastSyncAt: Date | null
  errorMessage: string | null
  connected: boolean
  syncing: boolean
  simulationMode: boolean
  firmwareCompat: FirmwareCompat
  firmwareLiveness: FirmwareLiveness
  heapStats: HeapStatsEntry[]
  isDayMode: boolean | null
}

interface DeviceState extends DeviceData {
  setConnected: (transport: Transport) => void
  setDisconnected: (error?: string | null) => void
  setSyncing: (syncing: boolean) => void
  setSyncComplete: (at: Date) => void
  setError: (message: string) => void
  clearError: () => void
  setFirmwareVersion: (version: string | null) => void
  setBoardId: (boardId: string | null) => void
  setFirmwareCompat: (compat: FirmwareCompat) => void
  setFirmwareLiveness: (liveness: FirmwareLiveness) => void
  pushHeapStats: (entry: Omit<HeapStatsEntry, 'receivedAt'>) => void
  clearHeapStats: () => void
  setIsDayMode: (isDay: boolean | null) => void
  enterSimulation: () => void
  exitSimulation: () => void
}

type SetDevice = StoreApi<DeviceState>['setState']

const SIMULATION_ON = '1'

const readSimulationMode = (): boolean => readItem(STORAGE_KEYS.simulationMode) === SIMULATION_ON

const writeSimulationMode = (on: boolean): void => {
  writeItem(STORAGE_KEYS.simulationMode, on ? SIMULATION_ON : '0')
}

const idleStatus = (connected: boolean): ConnectionStatus =>
  connected ? 'connected' : 'disconnected'

const SESSION_RESET = {
  transport: null,
  connected: false,
  syncing: false,
  isDayMode: null,
  firmwareVersion: null,
  boardId: null,
  firmwareCompat: { kind: 'unknown' },
  firmwareLiveness: { kind: 'unknown' },
  heapStats: [],
} satisfies Partial<DeviceData>

const initialData = (simulation: boolean): DeviceData => ({
  ...SESSION_RESET,
  status: simulation ? 'connected' : 'disconnected',
  connected: simulation,
  simulationMode: simulation,
  lastSyncAt: null,
  errorMessage: null,
})

const linkActions = (set: SetDevice) => ({
  setConnected: (transport: Transport) => {
    set({
      status: 'connected',
      transport,
      connected: true,
      simulationMode: false,
      syncing: false,
      errorMessage: null,
    })
  },
  setDisconnected: (error?: string | null) => {
    set({ ...SESSION_RESET, status: error ? 'error' : 'disconnected', errorMessage: error ?? null })
  },
  setSyncing: (syncing: boolean) => {
    set((s) => ({ status: syncing ? 'burning' : idleStatus(s.connected), syncing }))
  },
  setSyncComplete: (at: Date) => {
    set({ status: 'connected', lastSyncAt: at, syncing: false })
  },
  setError: (message: string) => {
    set({ status: 'error', errorMessage: message, syncing: false })
  },
  clearError: () => {
    set((s) => ({ status: idleStatus(s.connected), errorMessage: null }))
  },
})

const appendHeapStats = (stats: HeapStatsEntry[], entry: Omit<HeapStatsEntry, 'receivedAt'>) =>
  stats.concat({ ...entry, receivedAt: Date.now() }).slice(-HEAP_STATS_RING_CAP)

const firmwareActions = (set: SetDevice) => ({
  setFirmwareVersion: (firmwareVersion: string | null) => set({ firmwareVersion }),
  setBoardId: (boardId: string | null) => set({ boardId }),
  setFirmwareCompat: (firmwareCompat: FirmwareCompat) => set({ firmwareCompat }),
  setFirmwareLiveness: (firmwareLiveness: FirmwareLiveness) => set({ firmwareLiveness }),
  pushHeapStats: (entry: Omit<HeapStatsEntry, 'receivedAt'>) =>
    set((s) => ({ heapStats: appendHeapStats(s.heapStats, entry) })),
  clearHeapStats: () => set({ heapStats: [] }),
  setIsDayMode: (isDayMode: boolean | null) => set({ isDayMode }),
})

const simulationActions = (set: SetDevice) => ({
  enterSimulation: () => {
    writeSimulationMode(true)
    set({ simulationMode: true, status: 'connected', connected: true, transport: null })
  },
  exitSimulation: () => {
    writeSimulationMode(false)
    set({ simulationMode: false, status: 'disconnected', connected: false, transport: null })
  },
})

export const useDeviceStore = create<DeviceState>()((set) => ({
  ...initialData(readSimulationMode()),
  ...linkActions(set),
  ...firmwareActions(set),
  ...simulationActions(set),
}))
