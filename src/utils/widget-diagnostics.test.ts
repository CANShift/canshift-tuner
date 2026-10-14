import { describe, expect, it } from 'vitest'
import type { DashboardConfig, Widget } from '@canshift/core'
import { overflowingWidgetIds, overlappingWidgetIds } from './widget-diagnostics'
import { detectOverflow } from '../lib/detect-overflow'

const widget = (id: string, col: number, row: number, colSpan = 4, type = 'gauge'): Widget =>
  ({ id, type, layout: { col, colSpan, row, rowSpan: 2, zOrder: 0 } }) as unknown as Widget

describe('overlappingWidgetIds', () => {
  it('collects both widgets of every overlapping pair', () => {
    const ids = overlappingWidgetIds([widget('a', 0, 0), widget('b', 2, 1), widget('c', 8, 0)])
    expect([...ids]).toEqual(['a', 'b'])
  })

  it('never counts a warning overlay as overlapping', () => {
    expect(overlappingWidgetIds([widget('a', 0, 0), widget('w', 0, 0, 12, 'warning')]).size).toBe(0)
  })
})

describe('overflowingWidgetIds and detectOverflow', () => {
  it('finds the widgets that span past the grid, page by page', () => {
    const wide = widget('wide', 10, 0)
    const config = {
      pages: [{ id: 'p1', widgets: [widget('a', 0, 0), wide] }],
    } as unknown as DashboardConfig
    expect([...overflowingWidgetIds([widget('a', 0, 0), wide])]).toEqual(['wide'])
    expect(detectOverflow(config)).toEqual([
      { pageId: 'p1', widgetId: 'wide', type: 'gauge', layout: wide.layout },
    ])
  })
})
