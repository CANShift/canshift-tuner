import { afterEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEYS } from '../lib/local-storage'
import { STRINGS } from '../strings'

const storedSignals = (value: string): Map<string, string> => {
  const items = new Map([[STORAGE_KEYS.signals, value]])
  vi.stubGlobal('localStorage', {
    getItem: (name: string) => items.get(name) ?? null,
    setItem: (name: string, item: string) => items.set(name, item),
    removeItem: (name: string) => items.delete(name),
  })
  return items
}

const loadStore = async () => {
  vi.resetModules()
  const { useSignalStore } = await import('./signal.store')
  const { useToastStore } = await import('./toast.store')
  return { state: useSignalStore.getState(), toast: useToastStore.getState().toast }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('signal store loading saved signals', () => {
  it('keeps malformed saved signals aside and loads the default car', async () => {
    const raw = '{"selectedProfileKey":"custom","signals":[null]}'
    const items = storedSignals(raw)
    const { state, toast } = await loadStore()
    expect(state.carChosen).toBe(false)
    expect(state.signals.every((signal) => typeof signal.name === 'string')).toBe(true)
    expect(items.get(STORAGE_KEYS.signalsUnreadable)).toBe(raw)
    expect(items.has(STORAGE_KEYS.signals)).toBe(false)
    expect(toast?.message).toBe(STRINGS.car.savedSignalsUnreadable)
  })

  it('keeps saved signals that validate', async () => {
    const { state: before } = await loadStore()
    const signals = before.signals.slice(0, 1)
    const items = storedSignals(JSON.stringify({ selectedProfileKey: 'custom', signals }))
    const { state, toast } = await loadStore()
    expect(state.selectedProfileKey).toBe('custom')
    expect(state.signals).toEqual(signals)
    expect(items.has(STORAGE_KEYS.signalsUnreadable)).toBe(false)
    expect(toast).toBeNull()
  })
})
