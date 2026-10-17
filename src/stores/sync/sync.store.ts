import { create } from 'zustand'
import type { Refusal } from '../../lib/sync/refusal'
import type { DashSetup, DeviceSettings } from '../../lib/sync/setup'
import { readStoredSetup, writeStoredSetup } from './setup-storage'

export type SendState = 'idle' | 'sending' | 'refused' | 'failed'

interface SyncState {
  device: DashSetup
  settingsDraft: DeviceSettings
  sendState: SendState
  refusals: Refusal[]
  dashNewer: boolean
  setDevice: (patch: Partial<DashSetup>) => void
  setSettingsDraft: (patch: Partial<DeviceSettings>) => void
  setSendState: (sendState: SendState, refusals?: Refusal[]) => void
  setDashNewer: (dashNewer: boolean) => void
}

const stored = readStoredSetup()

export const useSyncStore = create<SyncState>()((set) => ({
  device: stored.device,
  settingsDraft: stored.settingsDraft,
  sendState: 'idle',
  refusals: [],
  dashNewer: false,
  setDevice: (patch) => set((s) => ({ device: { ...s.device, ...patch } })),
  setSettingsDraft: (patch) => set((s) => ({ settingsDraft: { ...s.settingsDraft, ...patch } })),
  setSendState: (sendState, refusals = []) => set({ sendState, refusals }),
  setDashNewer: (dashNewer) => set({ dashNewer }),
}))

useSyncStore.subscribe((state, previous) => {
  if (state.device === previous.device && state.settingsDraft === previous.settingsDraft) return
  writeStoredSetup({ device: state.device, settingsDraft: state.settingsDraft })
})
