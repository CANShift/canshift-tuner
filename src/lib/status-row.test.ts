import { describe, expect, it } from 'vitest'
import type { PageConfig } from '@canshift/core'
import { STATUS_ITEM_KINDS, defaultStatusItem, isStatusItem, withStatusItem } from './status-row'

const page = (statusRow?: PageConfig['statusRow']): PageConfig =>
  ({
    id: 'p1',
    backgroundImage: null,
    backgroundColor: '#000000',
    showTopBar: true,
    widgets: [],
    ...(statusRow ? { statusRow } : {}),
  }) as unknown as PageConfig

describe('status-row items', () => {
  it.each(STATUS_ITEM_KINDS)('builds a default %s item in its slot', (kind) => {
    const item = defaultStatusItem(kind, 'right')
    expect(item.type).toBe(kind)
    expect(item.position).toBe('right')
  })

  it('recognises only the kinds the editor writes', () => {
    expect(isStatusItem(defaultStatusItem('timer', 'center'))).toBe(true)
    expect(isStatusItem({ type: 'canRate', position: 'left' })).toBe(false)
    expect(isStatusItem(undefined)).toBe(false)
  })

  it('sets one slot and keeps the other', () => {
    const right = defaultStatusItem('flagWord', 'right')
    const start = page({ center: defaultStatusItem('timer', 'center') })
    const next = withStatusItem(start, 'right', right)
    expect(next.statusRow?.right).toEqual(right)
    expect(next.statusRow?.center).toEqual(start.statusRow?.center)
  })

  it('drops the status row once both slots are back to the bar default', () => {
    const start = page({ center: defaultStatusItem('timer', 'center') })
    expect(withStatusItem(start, 'center', null)).not.toHaveProperty('statusRow')
  })
})
