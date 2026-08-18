import { create } from 'zustand'
import { readItem, writeItem, STORAGE_KEYS } from '../lib/local-storage'

const INSPECTOR_KEY = STORAGE_KEYS.inspectorCollapsed
const CLI_OPEN_KEY = STORAGE_KEYS.cliOpen

const readCollapsed = (key: string): boolean => {
  try {
    return readItem(key) === '1'
  } catch {
    return false
  }
}

const writeCollapsed = (key: string, value: boolean): void => {
  try {
    writeItem(key, value ? '1' : '0')
  } catch {
    return
  }
}

interface UiState {
  burnDeniedAt: number | null
  signalBurnDenied: () => void
  inspectorCollapsed: boolean
  toggleInspector: () => void
  cliOpen: boolean
  toggleCli: () => void
}

export const useUiStore = create<UiState>((set) => ({
  burnDeniedAt: null,
  signalBurnDenied: () => {
    set({ burnDeniedAt: Date.now() })
  },
  inspectorCollapsed: readCollapsed(INSPECTOR_KEY),
  toggleInspector: () => {
    set((s) => {
      const next = !s.inspectorCollapsed
      writeCollapsed(INSPECTOR_KEY, next)
      return { inspectorCollapsed: next }
    })
  },
  cliOpen: readCollapsed(CLI_OPEN_KEY),
  toggleCli: () => {
    set((s) => {
      const next = !s.cliOpen
      writeCollapsed(CLI_OPEN_KEY, next)
      return { cliOpen: next }
    })
  },
}))
