import { DEFAULT_DEVICE_CONFIG } from '@canshift/core'
import type { CanSpeedKbps } from '@canshift/core'
import type { SoundSettings } from '@canshift/core/wire'
import { useSyncStore } from '../stores/sync/sync.store'
import type { ScreenRotation } from '../lib/sync/setup'

const DEFAULT_BRIGHTNESS = 80

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

export const useRotationDraft = (): DraftValue<ScreenRotation> => {
  const draft = useSyncStore((s) => s.settingsDraft.rotation)
  const device = useSyncStore((s) => s.device.settings.rotation)
  const setSettingsDraft = useSyncStore((s) => s.setSettingsDraft)
  return {
    value: draft ?? device ?? 0,
    set: (rotation) => {
      setSettingsDraft({ rotation })
    },
  }
}

export const useDayModeDraft = (): DraftValue<boolean> => {
  const draft = useSyncStore((s) => s.settingsDraft.dayMode)
  const device = useSyncStore((s) => s.device.settings.dayMode)
  const setSettingsDraft = useSyncStore((s) => s.setSettingsDraft)
  return {
    value: draft ?? device ?? false,
    set: (dayMode) => {
      setSettingsDraft({ dayMode })
    },
  }
}

export interface SoundDraft {
  value: SoundSettings
  set: (patch: Partial<SoundSettings>) => void
}

export const useSoundDraft = (): SoundDraft | null => {
  const draft = useSyncStore((s) => s.settingsDraft.sound)
  const device = useSyncStore((s) => s.device.settings.sound)
  const setSettingsDraft = useSyncStore((s) => s.setSettingsDraft)
  if (device === null) return null
  const value = draft ?? device
  return {
    value,
    set: (patch) => {
      setSettingsDraft({ sound: { ...value, ...patch } })
    },
  }
}
