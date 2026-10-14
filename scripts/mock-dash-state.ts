import simConfig from '../src/config/default-sim-config.json' with { type: 'json' }

export interface ChunkUpload {
  total: number
  parts: Buffer[]
}

export interface OtaSession {
  total: number
  sha256: string
  parts: Buffer[]
  written: number
}

export interface MockDashState {
  config: unknown
  deviceConfig: { can_speed_kbps: number }
  isDay: boolean
  bootedAt: number
  upload: ChunkUpload | null
  ota: OtaSession | null
  firmwareVersion: string
}

const DEFAULT_CAN_SPEED_KBPS = 500
const DEFAULT_FIRMWARE_VERSION = '0.20.0'

export const freshState = (): MockDashState => ({
  config: structuredClone(simConfig),
  deviceConfig: { can_speed_kbps: DEFAULT_CAN_SPEED_KBPS },
  isDay: false,
  bootedAt: Date.now(),
  upload: null,
  ota: null,
  firmwareVersion: DEFAULT_FIRMWARE_VERSION,
})

export const reboot = (state: MockDashState): void => {
  state.bootedAt = Date.now()
  state.upload = null
  state.ota = null
}
