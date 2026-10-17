import type { DashboardConfig, PageButtonRole, PageButtons } from '@canshift/core'
import { DEFAULT_UNIT_SYSTEM, defaultThemePreset } from '@canshift/core'
import type { UnitSystem } from '@canshift/core'
import { fixupSelection, pushHistory } from './helpers'
import { addCriticalAlertIn, removeCriticalAlertIn, updateCriticalAlertIn } from './critical-alerts'
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

const setUnitsIn = (s: DashboardState, units: UnitSystem): void => {
  if (!s.config || (s.config.units ?? DEFAULT_UNIT_SYSTEM) === units) return
  pushHistory(s, 'Changed units')
  s.config.units = units
}

const withPageButton = (
  buttons: PageButtons,
  role: PageButtonRole,
  signal: string | null
): PageButtons => {
  const { [role]: _replaced, ...others } = buttons
  return signal === null ? others : { ...others, [role]: signal }
}

const setPageButtonIn = (s: DashboardState, role: PageButtonRole, signal: string | null): void => {
  if (!s.config || (s.config.pageButtons?.[role] ?? null) === signal) return
  pushHistory(s, signal === null ? 'Cleared a page button' : 'Changed a page button')
  const buttons = withPageButton(s.config.pageButtons ?? {}, role, signal)
  if (Object.keys(buttons).length === 0) delete s.config.pageButtons
  else s.config.pageButtons = buttons
}

export const createLifecycleSlice: SliceCreator<LifecycleSlice> = (set) => ({
  config: null,
  lastSavedAt: null,
  setConfig: (config) => set((s) => applyLoadedConfig(s, withDefaultTheme(config))),
  replaceConfig: (config, label) => set((s) => replaceConfigIn(s, config, label)),
  setUnits: (units) => set((s) => setUnitsIn(s, units)),
  addCriticalAlert: (alert) => set((s) => addCriticalAlertIn(s, alert)),
  updateCriticalAlert: (index, alert) => set((s) => updateCriticalAlertIn(s, index, alert)),
  removeCriticalAlert: (index) => set((s) => removeCriticalAlertIn(s, index)),
  setPageButton: (role, signal) => set((s) => setPageButtonIn(s, role, signal)),
  markAutosaved: (ts) => set({ lastSavedAt: ts }),
})
