import { describe, it, expect } from 'vitest'
import { dialogReducer, INITIAL_DIALOG_STATE } from './useCanvasDialogs'

describe('dialogReducer', () => {
  it('opens a dialog without touching the others', () => {
    const next = dialogReducer(INITIAL_DIALOG_STATE, { key: 'diagOpen', value: true })
    expect(next).toEqual({ settingsOpen: false, diagOpen: true, shortcutsOpen: false })
  })

  it('resolves a functional updater against the current value', () => {
    const opened = dialogReducer(INITIAL_DIALOG_STATE, { key: 'settingsOpen', value: true })
    const toggled = dialogReducer(opened, { key: 'settingsOpen', value: (o) => !o })
    expect(toggled.settingsOpen).toBe(false)
  })

  it('returns the same reference when the value is unchanged (no needless render)', () => {
    const next = dialogReducer(INITIAL_DIALOG_STATE, { key: 'shortcutsOpen', value: false })
    expect(next).toBe(INITIAL_DIALOG_STATE)
  })
})
