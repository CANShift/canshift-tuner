import { create } from 'zustand'
import { readItem, writeItem, STORAGE_KEYS } from '../lib/local-storage'

const STORAGE_KEY = STORAGE_KEYS.observability

export const readStoredObservability = (): boolean => {
  try {
    return readItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

const writeStored = (enabled: boolean): void => {
  try {
    writeItem(STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    void 0
  }
}

interface ObservabilityState {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

export const useObservabilityStore = create<ObservabilityState>()((set) => ({
  enabled: readStoredObservability(),
  setEnabled: (enabled) => {
    writeStored(enabled)
    set({ enabled })
  },
}))

export const isObservabilityEnabled = (): boolean => useObservabilityStore.getState().enabled
