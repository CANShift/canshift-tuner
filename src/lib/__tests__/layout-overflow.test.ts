import { describe, expect, it } from 'vitest'
import type { DashboardConfig } from '@canshift/core'
import { describeLayoutOverflow } from '../layout-overflow'

interface TestWidget {
  id: string
  signal?: string
  col: number
  colSpan: number
  row: number
  rowSpan: number
}

const makeConfig = (pages: TestWidget[][]): DashboardConfig =>
  ({
    version: '1.25.0',
    name: 't',
    revLimitRpm: 7000,
    targetProfile: 'crowpanel-28',
    defaultPageId: 'p1',
    topBar: { height: 24, backgroundColor: '#000000', items: [] },
    pages: pages.map((widgets, index) => ({
      id: `p${String(index + 1)}`,
      backgroundColor: '#000000',
      showTopBar: true,
      visible: true,
      palette: {
        textColor: '#FFFFFF',
        accentColor: '#FF0000',
        warningColor: '#FFAA00',
        dangerColor: '#FF0000',
        dimColor: '#888888',
      },
      widgets: widgets.map((w) => ({
        id: w.id,
        type: 'label',
        signal: w.signal,
        layout: { col: w.col, colSpan: w.colSpan, row: w.row, rowSpan: w.rowSpan, zOrder: 0 },
        style: {},
        config: { text: '' },
      })),
    })),
  }) as unknown as DashboardConfig

describe('describeLayoutOverflow', () => {
  it('returns null when every widget fits', () => {
    expect(
      describeLayoutOverflow(makeConfig([[{ id: 'w1', col: 0, colSpan: 6, row: 0, rowSpan: 6 }]]))
    ).toBeNull()
  })

  it('reports the offending page, widget and computed bottom overflow', () => {
    const overflow = describeLayoutOverflow(
      makeConfig([
        [{ id: 'ok', col: 0, colSpan: 2, row: 0, rowSpan: 2 }],
        [],
        [],
        [{ id: 'egt', signal: 'egt', col: 0, colSpan: 2, row: 10, rowSpan: 4 }],
      ])
    )
    expect(overflow).not.toBeNull()
    expect(overflow?.pageId).toBe('p4')
    expect(overflow?.widgetId).toBe('egt')
    expect(overflow?.kicker).toBe('PAGE 4 · WIDGET EGT')
    expect(overflow?.title).toBe('This layout will not fit 320 × 240')
    expect(overflow?.body).toBe(
      'Bottom edge at 266 px, 26 px over. Burn stays disabled until it fits — the dash never scales a layout to make it work.'
    )
  })

  it('measures the right edge when the column span is the offender', () => {
    const overflow = describeLayoutOverflow(
      makeConfig([[{ id: 'w1', col: 8, colSpan: 6, row: 0, rowSpan: 2 }]])
    )
    expect(overflow?.body).toContain('Right edge at 364 px, 44 px over.')
  })

  it('measures the leading edge when a track is negative', () => {
    const overflow = describeLayoutOverflow(
      makeConfig([[{ id: 'w1', col: -1, colSpan: 2, row: 0, rowSpan: 2 }]])
    )
    expect(overflow?.body).toContain('Left edge at -18 px, 18 px over.')
  })

  it('falls back to the widget type when no signal is bound', () => {
    const overflow = describeLayoutOverflow(
      makeConfig([[{ id: 'w1', col: 0, colSpan: 2, row: 11, rowSpan: 4 }]])
    )
    expect(overflow?.kicker).toBe('PAGE 1 · WIDGET LABEL')
  })
})
