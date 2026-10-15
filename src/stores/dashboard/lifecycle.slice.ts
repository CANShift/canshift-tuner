import type { CriticalAlert, DashboardConfig } from '@canshift/core'
import { DEFAULT_UNIT_SYSTEM, defaultThemePreset } from '@canshift/core'
import type { ScreenProfileId, UnitSystem } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { pushHistory } from './helpers'
import type {
  DashboardState,
  LifecycleSlice,
  LoadFromDeviceOrDemoResult,
  SliceCreator,
} from './types'

const applyLoadedConfig = (s: DashboardState, config: DashboardConfig): void => {
  s.past = []
  s.future = []
  s.config = config
  s.isDirty = false
  s.selectedPageId = config.defaultPageId
  s.selectedWidgetId = null
  s.selectedWidgetIds = []
  s.pendingDeviceConfig = null
}

type LoadOutcome = LoadFromDeviceOrDemoResult

const loadOutcome = (s: DashboardState, deviceConfig: DashboardConfig | null): LoadOutcome => {
  if (deviceConfig === null) return s.config === null ? 'demo' : 'kept-edits'
  return s.config !== null && s.isDirty ? 'staged' : 'device'
}

const LOADERS: Record<
  LoadOutcome,
  (s: DashboardState, deviceConfig: DashboardConfig | null) => void
> = {
  staged: (s, deviceConfig) => {
    s.pendingDeviceConfig = deviceConfig
  },
  device: (s, deviceConfig) => {
    if (deviceConfig) applyLoadedConfig(s, deviceConfig)
  },
  demo: (s) => applyLoadedConfig(s, structuredClone(DEFAULT_SIM_CONFIG)),
  'kept-edits': () => undefined,
}

const setTargetProfileIn = (s: DashboardState, id: ScreenProfileId): void => {
  if (!s.config || s.config.targetProfile === id) return
  pushHistory(s, 'Changed target screen')
  s.config.targetProfile = id
  s.isDirty = true
}

const setUnitsIn = (s: DashboardState, units: UnitSystem): void => {
  if (!s.config || (s.config.units ?? DEFAULT_UNIT_SYSTEM) === units) return
  pushHistory(s, 'Changed units')
  s.config.units = units
  s.isDirty = true
}

const setCriticalAlertIn = (s: DashboardState, alert: CriticalAlert | null): void => {
  if (!s.config) return
  pushHistory(s, alert === null ? 'Cleared critical alert' : 'Changed critical alert')
  if (alert === null) delete s.config.criticalAlert
  else s.config.criticalAlert = alert
  s.isDirty = true
}

const acceptPendingIn = (s: DashboardState): void => {
  if (s.pendingDeviceConfig) applyLoadedConfig(s, s.pendingDeviceConfig)
}

export const createLifecycleSlice: SliceCreator<LifecycleSlice> = (set) => ({
  config: null,
  isDirty: false,
  pendingDeviceConfig: null,
  lastSavedAt: null,
  setConfig: (config) =>
    set((s) => applyLoadedConfig(s, { ...config, theme: config.theme ?? defaultThemePreset() })),
  setTargetProfile: (id) => set((s) => setTargetProfileIn(s, id)),
  setUnits: (units) => set((s) => setUnitsIn(s, units)),
  setCriticalAlert: (alert) => set((s) => setCriticalAlertIn(s, alert)),
  loadFromDeviceOrDemo: (deviceConfig) => {
    let outcome: LoadOutcome = 'kept-edits'
    set((s) => {
      outcome = loadOutcome(s, deviceConfig)
      LOADERS[outcome](s, deviceConfig)
    })
    return outcome
  },
  acceptPendingDeviceConfig: () => set(acceptPendingIn),
  dismissPendingDeviceConfig: () => set({ pendingDeviceConfig: null }),
  markAutosaved: (ts) => set({ lastSavedAt: ts }),
  markPushed: () => set({ isDirty: false }),
  markDirty: () =>
    set((s) => {
      if (s.config) s.isDirty = true
    }),
})
