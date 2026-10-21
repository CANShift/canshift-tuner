import { afterEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEYS } from '../lib/local-storage'

const storedSignals = (value: string) => {
  vi.stubGlobal('localStorage', {
    getItem: (name: string) => (name === STORAGE_KEYS.signals ? value : null),
    setItem: () => undefined,
  })
}

const loadStore = async () => {
  vi.resetModules()
  const { useSignalStore } = await import('./signal.store')
  return useSignalStore.getState()
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('signal store loading saved signals', () => {
  it('falls back to the default car when the saved signals are malformed', async () => {
    storedSignals('{"selectedProfileKey":"custom","signals":[null]}')
    const state = await loadStore()
    expect(state.carChosen).toBe(false)
    expect(state.signals.length).toBeGreaterThan(0)
    expect(state.signals.every((signal) => typeof signal.name === 'string')).toBe(true)
  })

  it('keeps saved signals that validate', async () => {
    const before = await loadStore()
    const signals = before.signals.slice(0, 1)
    storedSignals(JSON.stringify({ selectedProfileKey: 'custom', signals }))
    const state = await loadStore()
    expect(state.selectedProfileKey).toBe('custom')
    expect(state.signals).toEqual(signals)
  })
})
