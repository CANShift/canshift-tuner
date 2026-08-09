import { describe, it, expect } from 'vitest'
import { CURRENT_SCHEMA_VERSION } from '@canshift/core'
import { isRestorable, parseAutosave, serializeAutosave } from './autosave'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'

const source = () => ({
  config: structuredClone(DEFAULT_SIM_CONFIG),
  isDirty: true,
  selectedPageId: DEFAULT_SIM_CONFIG.pages[1]?.id ?? null,
  selectedWidgetId: DEFAULT_SIM_CONFIG.pages[1]?.widgets[0]?.id ?? null,
  selectedWidgetIds: [DEFAULT_SIM_CONFIG.pages[1]?.widgets[0]?.id ?? ''],
})

describe('autosave (#1849)', () => {
  it('round-trips config, dirtiness and selection byte-identically', () => {
    const raw = serializeAutosave(source(), 1234)
    expect(raw).not.toBeNull()
    const restored = parseAutosave(raw ?? '')
    expect(restored).not.toBeNull()
    expect(restored?.savedAt).toBe(1234)
    expect(restored?.isDirty).toBe(true)
    expect(restored?.selectedPageId).toBe(source().selectedPageId)
    expect(restored?.selectedWidgetId).toBe(source().selectedWidgetId)
    expect(JSON.stringify(restored?.config)).toBe(JSON.stringify(DEFAULT_SIM_CONFIG))
  })

  it('rejects corrupt payloads', () => {
    expect(parseAutosave('not json')).toBeNull()
    expect(parseAutosave('{}')).toBeNull()
    expect(parseAutosave(JSON.stringify({ savedAt: 1, config: { version: '0.0.1' } }))).toBeNull()
  })

  it('drops selection ids that no longer exist in the config', () => {
    const s = source()
    const raw = serializeAutosave(
      { ...s, selectedPageId: 'ghost', selectedWidgetId: 'ghost', selectedWidgetIds: ['ghost'] },
      1
    )
    const restored = parseAutosave(raw ?? '')
    expect(restored?.selectedPageId).toBe(DEFAULT_SIM_CONFIG.pages[0]?.id)
    expect(restored?.selectedWidgetId).toBeNull()
    expect(restored?.selectedWidgetIds).toEqual([])
  })

  it('returns null when there is no config to save', () => {
    expect(serializeAutosave({ ...source(), config: null }, 1)).toBeNull()
  })

  it('keeps the current schema version after migration passthrough', () => {
    const restored = parseAutosave(serializeAutosave(source(), 1) ?? '')
    expect(restored?.config.version).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('only restores a snapshot that holds unsaved work', () => {
    const dirty = parseAutosave(serializeAutosave(source(), 1) ?? '')
    expect(isRestorable(dirty)).toBe(true)

    const clean = parseAutosave(serializeAutosave({ ...source(), isDirty: false }, 1) ?? '')
    expect(clean).not.toBeNull()
    expect(isRestorable(clean)).toBe(false)

    expect(isRestorable(null)).toBe(false)
  })
})
