import { STRING_CAPS } from '@canshift/core'
import { describe, it, expect } from 'vitest'
import { createId, newId } from './id'

describe('createId', () => {
  it('prefixes the id with the given type', () => {
    expect(createId('gauge')).toMatch(/^gauge_/)
  })

  it('yields a unique id for every widget in a synchronous map (regression #1646)', () => {
    const widgets = [{ type: 'gauge' }, { type: 'gauge' }, { type: 'gauge' }]
    const ids = widgets.map((w) => createId(w.type))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('fits the id the dash stores, whatever the widget type', () => {
    for (const prefix of ['page', 'gauge', 'shift_light', 'backup']) {
      expect(createId(prefix).length).toBeLessThanOrEqual(STRING_CAPS.ID)
    }
  })

  it('stays unique across many calls', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createId('shift_light')))
    expect(ids.size).toBe(500)
  })
})

describe('newId', () => {
  it('returns distinct ids on successive calls', () => {
    expect(newId()).not.toBe(newId())
  })
})
