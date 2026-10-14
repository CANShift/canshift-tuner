import { describe, expect, it } from 'vitest'
import { ACTION_TYPE_LABELS } from './action-labels'
import { buildActionPresets } from './shared'

describe('ACTION_TYPE_LABELS', () => {
  it('names every action type the way the add-action menu does', () => {
    const presets = buildActionPresets(['p1'])
    presets.forEach((preset) => {
      expect(ACTION_TYPE_LABELS[preset.build().type]).toBe(preset.label)
    })
  })
})
