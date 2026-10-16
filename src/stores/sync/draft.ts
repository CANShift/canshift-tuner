import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { revertAll, revertChange } from '../../lib/sync/revert'
import type { Change } from '../../lib/sync/change'
import type { DashSetup } from '../../lib/sync/setup'
import { sameValue } from '../../lib/sync/setup-path'
import { useDashboardStore } from '../dashboard.store'
import { withDefaultTheme } from '../dashboard/lifecycle.slice'
import { useSyncStore } from './sync.store'
import type { DashboardConfig, DeviceConfig } from '@canshift/core'
import { STRINGS } from '../../strings'

export const readDraft = (): DashSetup => ({
  dashboard: useDashboardStore.getState().config,
  settings: useSyncStore.getState().settingsDraft,
})

const applyDraft = (next: DashSetup, label: string): void => {
  const current = useDashboardStore.getState().config
  if (next.dashboard !== null && next.dashboard !== current) {
    useDashboardStore.getState().replaceConfig(next.dashboard, label)
  }
  useSyncStore.getState().setSettingsDraft(next.settings)
}

export const undoChange = (change: Change): void => {
  applyDraft(revertChange(readDraft(), useSyncStore.getState().device, change), STRINGS.sync.undo)
}

export const undoAllChanges = (): void => {
  applyDraft(revertAll(readDraft(), useSyncStore.getState().device), STRINGS.sync.undoAll)
}

const untouched = (draft: DashboardConfig | null, baseline: DashboardConfig | null): boolean =>
  draft === null || sameValue(draft, baseline ?? DEFAULT_SIM_CONFIG)

export const adoptDeviceDashboard = (raw: DashboardConfig | null): void => {
  const config = raw === null ? null : withDefaultTheme(raw)
  const sync = useSyncStore.getState()
  const draft = useDashboardStore.getState().config
  if (config !== null && untouched(draft, sync.device.dashboard)) {
    useDashboardStore.getState().setConfig(config)
  }
  if (config === null && draft === null) useDashboardStore.getState().setConfig(DEFAULT_SIM_CONFIG)
  sync.setDevice({ dashboard: config })
}

export const adoptDeviceConfig = (config: DeviceConfig): void => {
  const sync = useSyncStore.getState()
  const draft = sync.settingsDraft.deviceConfig
  if (draft === null || sameValue(draft, sync.device.settings.deviceConfig)) {
    sync.setSettingsDraft({ deviceConfig: config })
  }
  sync.setDevice({ settings: { ...sync.device.settings, deviceConfig: config } })
}
