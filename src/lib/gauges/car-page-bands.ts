import { LAYOUT_GRID } from '@canshift/core'

export interface FilledBand<T> {
  rows: number
  fixed: boolean
  cells: readonly { span: number; item: T }[]
}

export interface PlacedCell<T> {
  col: number
  colSpan: number
  row: number
  rowSpan: number
  item: T
}

const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0)

const indexesByRemainder = (shares: readonly number[]): number[] =>
  shares
    .map((share, index) => ({ index, remainder: share - Math.floor(share) }))
    .sort((a, b) => b.remainder - a.remainder)
    .map(({ index }) => index)

export const splitSpan = (total: number, weights: readonly number[]): number[] => {
  const weightSum = sum(weights)
  if (weightSum === 0) return weights.map(() => 0)
  const shares = weights.map((weight) => (total * weight) / weightSum)
  const spans = shares.map(Math.floor)
  const roundedUp = new Set(indexesByRemainder(shares).slice(0, total - sum(spans)))
  return spans.map((span, index) => (roundedUp.has(index) ? span + 1 : span))
}

const startsOf = (spans: readonly number[]): number[] =>
  spans.map((_, index) => sum(spans.slice(0, index)))

const bandRows = <T>(bands: readonly FilledBand<T>[]): number[] => {
  const fixedRows = sum(bands.filter((band) => band.fixed).map((band) => band.rows))
  const flexible = bands.map((band) => (band.fixed ? 0 : band.rows))
  const shared = splitSpan(LAYOUT_GRID.ROWS - fixedRows, flexible)
  return bands.map((band, index) => (band.fixed ? band.rows : (shared[index] ?? 0)))
}

const placeBand = <T>(band: FilledBand<T>, row: number, rowSpan: number): PlacedCell<T>[] => {
  const colSpans = splitSpan(
    LAYOUT_GRID.COLUMNS,
    band.cells.map((cell) => cell.span)
  )
  const cols = startsOf(colSpans)
  return band.cells.map((cell, index) => ({
    col: cols[index] ?? 0,
    colSpan: colSpans[index] ?? 0,
    row,
    rowSpan,
    item: cell.item,
  }))
}

export const fillGrid = <T>(bands: readonly FilledBand<T>[]): PlacedCell<T>[] => {
  const kept = bands.filter((band) => band.cells.length > 0)
  const rowSpans = bandRows(kept)
  const rows = startsOf(rowSpans)
  return kept.flatMap((band, index) => placeBand(band, rows[index] ?? 0, rowSpans[index] ?? 0))
}
