import type { DashboardConfig, DeviceConfig, SignalDef } from '@canshift/core'
import type { SoundSettings } from '@canshift/core/wire'

export type ScreenRotation = 0 | 180

export interface DeviceSettings {
  deviceConfig: DeviceConfig | null
  brightness: number | null
  rotation: ScreenRotation | null
  dayMode: boolean | null
  sound: SoundSettings | null
}

export interface CarSetup {
  profileKey: string
  signals: SignalDef[]
}

export interface DashSetup {
  dashboard: DashboardConfig | null
  settings: DeviceSettings
  car: CarSetup | null
}

export const UNKNOWN_SETTINGS: DeviceSettings = {
  deviceConfig: null,
  brightness: null,
  rotation: null,
  dayMode: null,
  sound: null,
}

export const EMPTY_SETUP: DashSetup = { dashboard: null, settings: UNKNOWN_SETTINGS, car: null }
