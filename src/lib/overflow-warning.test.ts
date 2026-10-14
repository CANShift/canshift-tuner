import { describe, expect, it } from 'vitest'
import type { OverflowingWidget } from './detect-overflow'
import { overflowMessage, overflowSignature } from './overflow-warning'

const overflowing = (widgetId: string): OverflowingWidget =>
  ({
    pageId: 'p1',
    widgetId,
    type: 'gauge',
    layout: { col: 10, colSpan: 4, row: 0, rowSpan: 2, zOrder: 0 },
  }) as OverflowingWidget

describe('overflowSignature', () => {
  it('ignores widget order and includes the panel', () => {
    expect(overflowSignature('waveshare', [overflowing('b'), overflowing('a')])).toBe(
      'waveshare:a,b'
    )
    expect(overflowSignature(undefined, [])).toBe('default:')
  })
})

describe('overflowMessage', () => {
  it('lists one widget with its placement', () => {
    expect(overflowMessage([overflowing('a')])).toBe(
      '1 widget span past the 12-column grid — a (col 10+4, row 0+2)'
    )
  })

  it('samples three and counts the rest', () => {
    const message = overflowMessage(['a', 'b', 'c', 'd', 'e'].map(overflowing))
    expect(message).toMatch(/^5 widgets span/)
    expect(message).toMatch(/\+ 2 more$/)
  })
})
