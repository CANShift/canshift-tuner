import { create } from 'zustand'
import type { ScreenSettings } from '@canshift/core'

export type StoredScreenSettings = Required<Omit<ScreenSettings, 'brightness'>>

interface ScreenSettingsState extends StoredScreenSettings {
  update: (patch: Partial<StoredScreenSettings>) => void
}

const DEFAULTS: StoredScreenSettings = {
  rotation: 0,
}

export const useScreenSettingsStore = create<ScreenSettingsState>()((set) => ({
  ...DEFAULTS,

  update: (patch) => {
    set((s) => ({ ...s, ...patch }))
  },
}))
