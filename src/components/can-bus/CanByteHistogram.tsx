import { cva } from 'class-variance-authority'
import type { CanFrameStats } from '../../hooks/useCanScanner'
import { cn } from '@/lib/utils'

const MAX_BARS_PER_BYTE = 16

export interface CanByteHistogramProps {
  frame: CanFrameStats
}

export const CanByteHistogram = ({ frame }: CanByteHistogramProps) => {
  return (
    <div className="border-t border-ui-line-strong bg-ui-panel px-3.5 pb-4 pt-3">
      <div className="mb-2 text-[11px] uppercase tracking-[0.06em] text-ui-muted">
        Per-byte value distribution (most-common first)
      </div>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(110px,1fr))]">
        {frame.byteValueCounts.slice(0, frame.lastDlc).map((counts, byteIndex) => (
          <ByteColumn key={byteIndex} byteIndex={byteIndex} counts={counts} />
        ))}
      </div>
    </div>
  )
}

interface ByteColumnProps {
  byteIndex: number
  counts: ReadonlyMap<number, number>
}

const COLUMN = 'flex flex-col gap-1'
const COLUMN_HEADER = 'flex items-center justify-between font-mono text-[10px] text-ui-muted'

const distinctTag = cva('text-[9px] uppercase tracking-[0.04em]', {
  variants: {
    constant: {
      true: 'text-ui-muted',
      false: 'text-brand-accent',
    },
  },
  defaultVariants: { constant: false },
})

const barFill = cva('h-full', {
  variants: {
    constant: {
      true: 'bg-text-muted',
      false: 'bg-brand-accent',
    },
  },
  defaultVariants: { constant: false },
})

const ByteColumn = ({ byteIndex, counts }: ByteColumnProps) => {
  if (counts.size === 0) {
    return (
      <div className={COLUMN}>
        <div className={COLUMN_HEADER}>byte {byteIndex}</div>
        <div className="text-[11px] text-ui-muted">—</div>
      </div>
    )
  }

  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_BARS_PER_BYTE)
  const max = sorted[0]?.[1] ?? 1
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0)
  const distinct = counts.size
  const constant = distinct === 1

  return (
    <div className={COLUMN}>
      <div className={COLUMN_HEADER}>
        <span>byte {byteIndex}</span>
        <span className={cn(distinctTag({ constant }))}>
          {constant ? 'const' : `${String(distinct)} vals`}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {sorted.map(([value, count]) => (
          <div key={value} className="flex items-center gap-1.5 text-[10px]">
            <span className="min-w-8 font-mono text-ui-muted">{formatByte(value)}</span>
            <div className="h-1.5 flex-1 overflow-hidden bg-ui-bg">
              <div
                className={cn(barFill({ constant }))}
                // eslint-disable-next-line no-inline-style/no-inline-style
                style={{ width: `${String((count / max) * 100)}%` }}
              />
            </div>
            <span className="min-w-[30px] text-right font-mono tabular-nums text-ui-muted">
              {formatPct(count, total)}
            </span>
          </div>
        ))}
        {counts.size > MAX_BARS_PER_BYTE && (
          <div className="text-[10px] italic text-ui-muted">
            + {String(counts.size - MAX_BARS_PER_BYTE)} more
          </div>
        )}
      </div>
    </div>
  )
}

const formatByte = (value: number): string => {
  return `0x${value.toString(16).toUpperCase().padStart(2, '0')}`
}

const formatPct = (count: number, total: number): string => {
  if (total === 0) return '0 %'
  return `${((count / total) * 100).toFixed(0)} %`
}
