import { DeviceConfigSchema, SCREEN_SETTINGS_BOUNDS } from '@canshift/core'
import type { DeviceConfig } from '@canshift/core'
import { isJsonRecord, parseJsonRecord, type JsonRecord } from '../../lib/json-record'
import { readItem, removeItem, STORAGE_KEYS, writeItem } from '../../lib/local-storage'
import { EMPTY_SETUP, UNKNOWN_SETTINGS } from '../../lib/sync/setup'
import type { DashSetup, DeviceSettings } from '../../lib/sync/setup'
import { validConfig } from '../dashboard/autosave'

export interface StoredSetup {
  device: DashSetup
  settingsDraft: DeviceSettings
}

const EMPTY_STORED: StoredSetup = { device: EMPTY_SETUP, settingsDraft: UNKNOWN_SETTINGS }

const brightnessOf = (value: unknown): number | null =>
  typeof value === 'number' &&
  value >= SCREEN_SETTINGS_BOUNDS.brightnessMinPct &&
  value <= SCREEN_SETTINGS_BOUNDS.brightnessMaxPct
    ? value
    : null

const deviceConfigOf = (value: unknown): DeviceConfig | null => {
  const parsed = DeviceConfigSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

const settingsOf = (value: unknown): DeviceSettings => {
  if (!isJsonRecord(value)) return UNKNOWN_SETTINGS
  return {
    deviceConfig: deviceConfigOf(value.deviceConfig),
    brightness: brightnessOf(value.brightness),
  }
}

const deviceOf = (value: JsonRecord): DashSetup => ({
  dashboard: value.dashboard === null ? null : validConfig(value.dashboard),
  settings: settingsOf(value.settings),
})

export const parseStoredSetup = (raw: string): StoredSetup => {
  const record = parseJsonRecord(raw)
  if (record === null || !isJsonRecord(record.device)) return EMPTY_STORED
  return { device: deviceOf(record.device), settingsDraft: settingsOf(record.settingsDraft) }
}

export const readStoredSetup = (): StoredSetup => {
  const raw = readItem(STORAGE_KEYS.setup)
  if (raw === null) return EMPTY_STORED
  const stored = parseStoredSetup(raw)
  if (stored === EMPTY_STORED) removeItem(STORAGE_KEYS.setup)
  return stored
}

export const writeStoredSetup = (stored: StoredSetup): boolean =>
  writeItem(STORAGE_KEYS.setup, JSON.stringify(stored))
