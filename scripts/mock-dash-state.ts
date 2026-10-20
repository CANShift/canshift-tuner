import type { KeyObject } from 'node:crypto'
import type { ConfigReloadState } from '../src/transport/types'
import simConfig from '../src/config/default-sim-config.json' with { type: 'json' }

interface ChunkUpload {
  total: number
  parts: Buffer[]
}

export interface OtaSession {
  total: number
  sha256: string
  signature: Buffer
  parts: Buffer[]
  written: number
}

export interface MockDashState {
  config: unknown
  configReload: ConfigReloadState
  deviceConfig: { can_speed_kbps: number }
  isDay: boolean
  volume: number
  sounds: { boot: boolean; shift_tone: boolean }
  bootedAt: number
  upload: ChunkUpload | null
  ota: OtaSession | null
  busScanStartedAt: number | null
  firmwareVersion: string
  signingKey: KeyObject
}

const DEFAULT_CAN_SPEED_KBPS = 500
const DEFAULT_FIRMWARE_VERSION = '0.20.0'
const DEFAULT_VOLUME_PCT = 70

export const freshState = (signingKey: KeyObject): MockDashState => ({
  config: structuredClone(simConfig),
  configReload: 'idle',
  deviceConfig: { can_speed_kbps: DEFAULT_CAN_SPEED_KBPS },
  isDay: false,
  volume: DEFAULT_VOLUME_PCT,
  sounds: { boot: true, shift_tone: false },
  bootedAt: Date.now(),
  upload: null,
  ota: null,
  busScanStartedAt: null,
  firmwareVersion: DEFAULT_FIRMWARE_VERSION,
  signingKey,
})

export const reboot = (state: MockDashState): void => {
  state.bootedAt = Date.now()
  state.configReload = 'idle'
  state.upload = null
  state.ota = null
  state.busScanStartedAt = null
}
