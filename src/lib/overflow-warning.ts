import type { OverflowingWidget } from './detect-overflow'

const SAMPLE_SIZE = 3

export const overflowSignature = (
  profile: string | undefined,
  overflowing: readonly OverflowingWidget[]
): string =>
  `${profile ?? 'default'}:${overflowing
    .map((o) => o.widgetId)
    .sort()
    .join(',')}`

const placement = (o: OverflowingWidget): string =>
  `${o.widgetId} (col ${String(o.layout.col)}+${String(o.layout.colSpan)}, row ${String(o.layout.row)}+${String(o.layout.rowSpan)})`

export const overflowMessage = (overflowing: readonly OverflowingWidget[]): string => {
  const count = overflowing.length
  const sample = overflowing.slice(0, SAMPLE_SIZE).map(placement).join(', ')
  const more = count > SAMPLE_SIZE ? ` + ${String(count - SAMPLE_SIZE)} more` : ''
  return `${String(count)} widget${count === 1 ? '' : 's'} span past the 12-column grid — ${sample}${more}`
}
