import { create } from 'zustand'
import { readItem, writeItem, STORAGE_KEYS } from '../lib/local-storage'

const LEFT_NAV_KEY = STORAGE_KEYS.leftNavCollapsed
const INSPECTOR_KEY = STORAGE_KEYS.inspectorCollapsed

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
  unboundBurnConfirm: number | null
  requestUnboundBurnConfirm: (count: number) => void
  clearUnboundBurnConfirm: () => void
  leftNavCollapsed: boolean
  toggleLeftNav: () => void
  inspectorCollapsed: boolean
  toggleInspector: () => void
}

export const useUiStore = create<UiState>((set) => ({
  burnDeniedAt: null,
  signalBurnDenied: () => {
    set({ burnDeniedAt: Date.now() })
  },
  unboundBurnConfirm: null,
  requestUnboundBurnConfirm: (count) => {
    set({ unboundBurnConfirm: count })
  },
  clearUnboundBurnConfirm: () => {
    set({ unboundBurnConfirm: null })
  },
  leftNavCollapsed: readCollapsed(LEFT_NAV_KEY),
  toggleLeftNav: () => {
    set((s) => {
      const next = !s.leftNavCollapsed
      writeCollapsed(LEFT_NAV_KEY, next)
      return { leftNavCollapsed: next }
    })
  },
  inspectorCollapsed: readCollapsed(INSPECTOR_KEY),
  toggleInspector: () => {
    set((s) => {
      const next = !s.inspectorCollapsed
      writeCollapsed(INSPECTOR_KEY, next)
      return { inspectorCollapsed: next }
    })
  },
}))
