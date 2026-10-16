import { DEFAULT_DEVICE_CONFIG } from '@canshift/core'
import type { CanSpeedKbps } from '@canshift/core'
import { useSyncStore } from '../stores/sync/sync.store'

export const DEFAULT_BRIGHTNESS = 80

export interface DraftValue<T> {
  value: T
  set: (value: T) => void
}

export const useBrightnessDraft = (): DraftValue<number> => {
  const draft = useSyncStore((s) => s.settingsDraft.brightness)
  const device = useSyncStore((s) => s.device.settings.brightness)
  const setSettingsDraft = useSyncStore((s) => s.setSettingsDraft)
  return {
    value: draft ?? device ?? DEFAULT_BRIGHTNESS,
    set: (brightness) => {
      setSettingsDraft({ brightness })
    },
  }
}

export const useCanSpeedDraft = (): DraftValue<CanSpeedKbps> => {
  const draft = useSyncStore((s) => s.settingsDraft.deviceConfig)
  const device = useSyncStore((s) => s.device.settings.deviceConfig)
  const setSettingsDraft = useSyncStore((s) => s.setSettingsDraft)
  const base = draft ?? device ?? DEFAULT_DEVICE_CONFIG
  return {
    value: base.canSpeedKbps,
    set: (canSpeedKbps) => {
      setSettingsDraft({ deviceConfig: { ...base, canSpeedKbps } })
    },
  }
}
