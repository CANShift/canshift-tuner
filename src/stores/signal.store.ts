import { create, type StateCreator } from 'zustand'
import type { SignalDef } from '@canshift/core'
import { ECU_PROFILES } from '@canshift/core'
import { readItem, writeItem, STORAGE_KEYS } from '../lib/local-storage'
import { parseJsonRecord } from '../lib/json-record'

const FALLBACK_PROFILE_ID = 'maxxecu-street'
const FALLBACK_SIGNALS: SignalDef[] =
  ECU_PROFILES.find((p) => p.id === FALLBACK_PROFILE_ID)?.signals ?? []

const STORAGE_KEY = STORAGE_KEYS.signals
export const DEFAULT_PROFILE_KEY = `builtin:${FALLBACK_PROFILE_ID}`

interface StoredState {
  selectedProfileKey: string
  signals: SignalDef[]
  profileSignals: SignalDef[]
}

const readStored = (): StoredState | null => {
  const raw = readItem(STORAGE_KEY)
  const parsed = raw === null ? null : parseJsonRecord(raw)
  if (parsed === null) return null
  const { selectedProfileKey, signals, profileSignals } = parsed
  if (typeof selectedProfileKey !== 'string' || !Array.isArray(signals)) return null
  const stored = signals as SignalDef[]
  return {
    selectedProfileKey,
    signals: stored,
    profileSignals: Array.isArray(profileSignals) ? (profileSignals as SignalDef[]) : stored,
  }
}

const writeStored = (state: StoredState): void => {
  writeItem(STORAGE_KEY, JSON.stringify(state))
}

interface SignalState extends StoredState {
  carChosen: boolean
  setSignals: (signals: SignalDef[]) => void
  updateSignal: (name: string, patch: Partial<SignalDef>) => void
  putSignal: (signal: SignalDef) => void
  removeSignal: (name: string) => void
  applyProfile: (key: string, signals: SignalDef[]) => void
  setCar: (car: { profileKey: string; signals: SignalDef[] }) => void
}

const stored = readStored()

const initialSignals: SignalDef[] =
  stored && stored.signals.length > 0 ? stored.signals : FALLBACK_SIGNALS

const persisted = (state: SignalState): StoredState => ({
  selectedProfileKey: state.selectedProfileKey,
  signals: state.signals,
  profileSignals: state.profileSignals,
})

const withSignal = (signals: readonly SignalDef[], signal: SignalDef): SignalDef[] =>
  signals.some((s) => s.name === signal.name)
    ? signals.map((s) => (s.name === signal.name ? signal : s))
    : [...signals, signal]

const saveSignals = (state: SignalState, signals: SignalDef[]): Pick<SignalState, 'signals'> => {
  writeStored({ ...persisted(state), signals })
  return { signals }
}

type StoreSet = Parameters<StateCreator<SignalState>>[0]

const editActions = (
  set: StoreSet
): Pick<SignalState, 'updateSignal' | 'putSignal' | 'removeSignal'> => ({
  updateSignal: (name, patch) => {
    set((state) =>
      saveSignals(
        state,
        state.signals.map((signal) => (signal.name === name ? { ...signal, ...patch } : signal))
      )
    )
  },
  putSignal: (signal) => {
    set((state) => saveSignals(state, withSignal(state.signals, signal)))
  },
  removeSignal: (name) => {
    set((state) =>
      saveSignals(
        state,
        state.signals.filter((signal) => signal.name !== name)
      )
    )
  },
})

export const useSignalStore = create<SignalState>()((set) => ({
  signals: initialSignals,
  profileSignals: stored?.profileSignals ?? initialSignals,
  selectedProfileKey: stored?.selectedProfileKey ?? DEFAULT_PROFILE_KEY,
  carChosen: stored !== null,
  setSignals: (signals) => {
    set({ signals })
  },
  ...editActions(set),
  setCar: ({ profileKey, signals }) => {
    set((state) => {
      const profileSignals =
        profileKey === state.selectedProfileKey ? state.profileSignals : signals
      writeStored({ selectedProfileKey: profileKey, signals, profileSignals })
      return { selectedProfileKey: profileKey, signals, profileSignals }
    })
  },
  applyProfile: (key, signals) => {
    set({ selectedProfileKey: key, signals, profileSignals: signals, carChosen: true })
    writeStored({ selectedProfileKey: key, signals, profileSignals: signals })
  },
}))
