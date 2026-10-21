import { create, type StateCreator } from 'zustand'
import * as z from 'zod'
import type { SignalDef } from '@canshift/core'
import { ECU_PROFILES, SignalDefSchema } from '@canshift/core'
import { readItem, removeItem, writeItem, STORAGE_KEYS } from '../lib/local-storage'
import { parseJsonRecord } from '../lib/json-record'
import { STRINGS } from '../strings'
import { useToastStore } from './toast.store'

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

const SignalListSchema = z.array(SignalDefSchema)

const signalsOf = (value: unknown): SignalDef[] | null => {
  const parsed = SignalListSchema.safeParse(value)
  return parsed.success ? (parsed.data as SignalDef[]) : null
}

const parseStored = (raw: string): StoredState | null => {
  const parsed = parseJsonRecord(raw)
  if (parsed === null || typeof parsed.selectedProfileKey !== 'string') return null
  const signals = signalsOf(parsed.signals)
  if (signals === null) return null
  return {
    selectedProfileKey: parsed.selectedProfileKey,
    signals,
    profileSignals: signalsOf(parsed.profileSignals) ?? signals,
  }
}

const keepAside = (raw: string): void => {
  if (writeItem(STORAGE_KEYS.signalsUnreadable, raw)) removeItem(STORAGE_KEY)
  useToastStore.getState().show(STRINGS.car.savedSignalsUnreadable, 'warning')
}

const readStored = (): StoredState | null => {
  const raw = readItem(STORAGE_KEY)
  if (raw === null) return null
  const stored = parseStored(raw)
  if (stored === null) keepAside(raw)
  return stored
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
