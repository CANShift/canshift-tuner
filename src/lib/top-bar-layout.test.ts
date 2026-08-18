import { describe, expect, it } from 'vitest'
import type { PageStatusRow, TopBarItem } from '@canshift/core'
import { mergePageStatusRow } from './top-bar-layout'

const item = (position: TopBarItem['position'], text: string): TopBarItem =>
  ({ type: 'label', text, position }) as TopBarItem

const LAYOUT: TopBarItem[] = [item('left', 'CAN'), item('center', 'MAP'), item('right', 'LAP')]

describe('mergePageStatusRow', () => {
  it('leaves the layout alone when the page declares nothing', () => {
    expect(mergePageStatusRow(LAYOUT, undefined)).toBe(LAYOUT)
    expect(mergePageStatusRow(LAYOUT, {} as PageStatusRow)).toBe(LAYOUT)
  })

  it('replaces every base item at the position the page overrides', () => {
    const merged = mergePageStatusRow(LAYOUT, { right: item('right', 'MAX OIL') } as PageStatusRow)
    expect(merged.map((i) => (i as { text: string }).text)).toEqual(['CAN', 'MAP', 'MAX OIL'])
  })

  it('overrides both slots independently', () => {
    const merged = mergePageStatusRow(LAYOUT, {
      center: item('center', 'ALS ON'),
      right: item('right', 'ARMED'),
    } as PageStatusRow)
    expect(merged.map((i) => (i as { text: string }).text)).toEqual(['CAN', 'ALS ON', 'ARMED'])
  })

  it('never touches the left slot, which no page can override', () => {
    const merged = mergePageStatusRow([...LAYOUT, item('left', 'RATE')], {
      right: item('right', 'PEAK'),
    } as PageStatusRow)
    expect(merged.filter((i) => i.position === 'left')).toHaveLength(2)
  })

  it('drops several base items at an overridden position, not just the first', () => {
    const crowded = [item('right', 'A'), item('right', 'B'), item('left', 'CAN')]
    const merged = mergePageStatusRow(crowded, { right: item('right', 'ONE') } as PageStatusRow)
    expect(merged.map((i) => (i as { text: string }).text)).toEqual(['CAN', 'ONE'])
  })
})
