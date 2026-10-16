import { describe, expect, it } from 'vitest'
import type { GridPlacement } from '@canshift/core'
import { autoPlace } from './layout'

const placement = (col: number, colSpan: number, row: number, rowSpan: number): GridPlacement => ({
  col,
  colSpan,
  row,
  rowSpan,
})

describe('autoPlace', () => {
  it('places at the origin on an empty grid', () => {
    expect(autoPlace({ colSpan: 6, rowSpan: 6 }, [])).toEqual({ col: 0, row: 0 })
  })

  it('scans row-major for the first free slot', () => {
    const occupied = [placement(0, 6, 0, 6)]
    expect(autoPlace({ colSpan: 6, rowSpan: 6 }, occupied)).toEqual({ col: 6, row: 0 })
  })

  it('drops to the next row when the first is full', () => {
    const occupied = [placement(0, 6, 0, 6), placement(6, 6, 0, 6)]
    expect(autoPlace({ colSpan: 6, rowSpan: 6 }, occupied)).toEqual({ col: 0, row: 6 })
  })

  it('returns null when nothing fits', () => {
    const occupied = [placement(0, 12, 0, 12)]
    expect(autoPlace({ colSpan: 6, rowSpan: 6 }, occupied)).toBeNull()
  })
})
