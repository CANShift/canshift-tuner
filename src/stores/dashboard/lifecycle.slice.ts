import type { CriticalAlert, DashboardConfig } from '@canshift/core'
import { DEFAULT_UNIT_SYSTEM, defaultThemePreset } from '@canshift/core'
import type { ScreenProfileId, UnitSystem } from '@canshift/core'
import { fixupSelection, pushHistory } from './helpers'
import type { DashboardState, LifecycleSlice, SliceCreator } from './types'

export const withDefaultTheme = (config: DashboardConfig): DashboardConfig => ({
  ...config,
  theme: config.theme ?? defaultThemePreset(),
})

const applyLoadedConfig = (s: DashboardState, config: DashboardConfig): void => {
  s.past = []
  s.future = []
  s.config = config
  s.selectedPageId = config.defaultPageId
  s.selectedWidgetId = null
  s.selectedWidgetIds = []
}

const replaceConfigIn = (s: DashboardState, config: DashboardConfig, label: string): void => {
  pushHistory(s, label)
  s.config = config
  fixupSelection(s)
}

const setTargetProfileIn = (s: DashboardState, id: ScreenProfileId): void => {
  if (!s.config || s.config.targetProfile === id) return
  pushHistory(s, 'Changed target screen')
  s.config.targetProfile = id
}

const setUnitsIn = (s: DashboardState, units: UnitSystem): void => {
  if (!s.config || (s.config.units ?? DEFAULT_UNIT_SYSTEM) === units) return
  pushHistory(s, 'Changed units')
  s.config.units = units
}

const setCriticalAlertIn = (s: DashboardState, alert: CriticalAlert | null): void => {
  if (!s.config) return
  pushHistory(s, alert === null ? 'Cleared critical alert' : 'Changed critical alert')
  if (alert === null) delete s.config.criticalAlert
  else s.config.criticalAlert = alert
}

export const createLifecycleSlice: SliceCreator<LifecycleSlice> = (set) => ({
  config: null,
  lastSavedAt: null,
  setConfig: (config) => set((s) => applyLoadedConfig(s, withDefaultTheme(config))),
  replaceConfig: (config, label) => set((s) => replaceConfigIn(s, config, label)),
  setTargetProfile: (id) => set((s) => setTargetProfileIn(s, id)),
  setUnits: (units) => set((s) => setUnitsIn(s, units)),
  setCriticalAlert: (alert) => set((s) => setCriticalAlertIn(s, alert)),
  markAutosaved: (ts) => set({ lastSavedAt: ts }),
})
