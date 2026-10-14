import simConfig from '../src/config/default-sim-config.json' with { type: 'json' }

export interface ChunkUpload {
  total: number
  parts: Buffer[]
}

export interface MockDashState {
  config: unknown
  deviceConfig: { can_speed_kbps: number }
  isDay: boolean
  bootedAt: number
  upload: ChunkUpload | null
}

const DEFAULT_CAN_SPEED_KBPS = 500

export const freshState = (): MockDashState => ({
  config: structuredClone(simConfig),
  deviceConfig: { can_speed_kbps: DEFAULT_CAN_SPEED_KBPS },
  isDay: false,
  bootedAt: Date.now(),
  upload: null,
})

export const reboot = (state: MockDashState): void => {
  state.bootedAt = Date.now()
  state.upload = null
}
