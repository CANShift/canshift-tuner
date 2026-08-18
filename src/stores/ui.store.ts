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
  inspectorCollapsed: boolean
  toggleInspector: () => void
  cliOpen: boolean
  toggleCli: () => void
  importNotice: string | null
  setImportNotice: (notice: string | null) => void
  savedAt: number | null
  markSaved: () => void
}

export const useUiStore = create<UiState>((set) => ({
  inspectorCollapsed: readCollapsed(INSPECTOR_KEY),
  toggleInspector: () => {
    set((s) => {
      const next = !s.inspectorCollapsed
      writeCollapsed(INSPECTOR_KEY, next)
      return { inspectorCollapsed: next }
    })
  },
  importNotice: null,
  setImportNotice: (notice) => {
    set({ importNotice: notice })
  },
  savedAt: null,
  markSaved: () => {
    set({ savedAt: Date.now() })
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
