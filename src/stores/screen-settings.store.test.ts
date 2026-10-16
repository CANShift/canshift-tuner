import { describe, it, expect, beforeEach } from 'vitest'
import { useScreenSettingsStore, type StoredScreenSettings } from './screen-settings.store'

const DEFAULTS: StoredScreenSettings = { rotation: 0 }

describe('screen-settings.store (#1705)', () => {
  beforeEach(() => {
    useScreenSettingsStore.getState().update(DEFAULTS)
  })

  it('exposes core-shaped defaults', () => {
    expect(useScreenSettingsStore.getState().rotation).toBe(0)
  })

  it('updates the rotation', () => {
    useScreenSettingsStore.getState().update({ rotation: 180 })
    expect(useScreenSettingsStore.getState().rotation).toBe(180)
  })
})
