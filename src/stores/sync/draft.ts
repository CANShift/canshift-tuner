import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { revertAll, revertChange } from '../../lib/sync/revert'
import type { Change } from '../../lib/sync/change'
import type { CarSetup, DashSetup } from '../../lib/sync/setup'
import { useSignalStore } from '../signal.store'
import { sameValue } from '../../lib/sync/setup-path'
import { useDashboardStore } from '../dashboard.store'
import { withDefaultTheme } from '../dashboard/lifecycle.slice'
import { useSyncStore } from './sync.store'
import type { DashboardConfig, DeviceConfig } from '@canshift/core'
import { compareDash, untouched } from '../../lib/sync/compare-dash'
import type { SoundSettings } from '@canshift/core/wire'
import { STRINGS } from '../../strings'

const readCar = (): CarSetup => {
  const { selectedProfileKey, signals } = useSignalStore.getState()
  return { profileKey: selectedProfileKey, signals }
}

export const readDraft = (): DashSetup => ({
  dashboard: useDashboardStore.getState().config,
  settings: useSyncStore.getState().settingsDraft,
  car: readCar(),
})

const applyDraft = (next: DashSetup, label: string): void => {
  const current = useDashboardStore.getState().config
  if (next.dashboard !== null && next.dashboard !== current) {
    useDashboardStore.getState().replaceConfig(next.dashboard, label)
  }
  useSyncStore.getState().setSettingsDraft(next.settings)
  if (next.car !== null && !sameValue(next.car, readCar()))
    useSignalStore.getState().setCar(next.car)
}

export const undoChange = (change: Change): void => {
  applyDraft(revertChange(readDraft(), useSyncStore.getState().device, change), STRINGS.sync.undo)
}

export const undoAllChanges = (): void => {
  applyDraft(revertAll(readDraft(), useSyncStore.getState().device), STRINGS.sync.undoAll)
}

export const pullFromDash = (): void => {
  applyDraft(revertAll(readDraft(), useSyncStore.getState().device), STRINGS.sync.pulled)
  useSyncStore.getState().setComparison(null)
}

export const adoptDeviceDashboard = (raw: DashboardConfig | null): void => {
  const config = raw === null ? null : withDefaultTheme(raw)
  const sync = useSyncStore.getState()
  const draft = useDashboardStore.getState().config
  sync.setComparison(compareDash(config, draft, sync.device.dashboard))
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

export const adoptDayMode = (dayMode: boolean): void => {
  const sync = useSyncStore.getState()
  const draft = sync.settingsDraft.dayMode
  if (draft === null || draft === sync.device.settings.dayMode) sync.setSettingsDraft({ dayMode })
  sync.setDevice({ settings: { ...sync.device.settings, dayMode } })
}

export const adoptSound = (sound: SoundSettings | null): void => {
  const sync = useSyncStore.getState()
  const draft = sync.settingsDraft.sound
  if (sound === null || draft === null || sameValue(draft, sync.device.settings.sound)) {
    sync.setSettingsDraft({ sound })
  }
  sync.setDevice({ settings: { ...sync.device.settings, sound } })
}
