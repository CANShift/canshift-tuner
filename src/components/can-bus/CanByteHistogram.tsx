import { cva } from 'class-variance-authority'
import type { CanFrameStats } from '../../hooks/useCanScanner'
import { cn } from '@/lib/utils'
import { hexByte } from './can-format'

const MAX_BARS_PER_BYTE = 16

export interface CanByteHistogramProps {
  frame: CanFrameStats
}

export const CanByteHistogram = ({ frame }: CanByteHistogramProps) => {
  return (
    <div className="border-t border-app-border bg-app-surface px-3.5 pb-4 pt-3">
      <div className="mb-2 text-[11px] uppercase tracking-[0.06em] text-app-muted">
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
const COLUMN_HEADER = 'flex items-center justify-between font-mono text-[10px] text-app-muted'

const distinctTag = cva('text-[9px] uppercase tracking-[0.04em]', {
  variants: {
    constant: {
      true: 'text-app-muted',
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

interface ByteDistribution {
  bars: [number, number][]
  max: number
  total: number
  distinct: number
  constant: boolean
}

const byteDistribution = (counts: ReadonlyMap<number, number>): ByteDistribution => {
  const bars = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_BARS_PER_BYTE)
  return {
    bars,
    max: bars[0]?.[1] ?? 1,
    total: Array.from(counts.values()).reduce((a, b) => a + b, 0),
    distinct: counts.size,
    constant: counts.size === 1,
  }
}

const EmptyByteColumn = ({ byteIndex }: { byteIndex: number }) => (
  <div className={COLUMN}>
    <div className={COLUMN_HEADER}>byte {byteIndex}</div>
    <div className="text-[11px] text-app-muted">—</div>
  </div>
)

interface ByteBarProps {
  value: number
  count: number
  dist: ByteDistribution
}

const ByteBar = ({ value, count, dist }: ByteBarProps) => (
  <div className="flex items-center gap-1.5 text-[10px]">
    <span className="min-w-8 font-mono text-app-muted">{formatByte(value)}</span>
    <div className="h-1.5 flex-1 overflow-hidden bg-app-bg">
      <div
        className={cn(barFill({ constant: dist.constant }))}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ width: `${String((count / dist.max) * 100)}%` }}
      />
    </div>
    <span className="min-w-[30px] text-right font-mono tabular-nums text-app-muted">
      {formatPct(count, dist.total)}
    </span>
  </div>
)

const FilledByteColumn = ({ byteIndex, dist }: { byteIndex: number; dist: ByteDistribution }) => (
  <div className={COLUMN}>
    <div className={COLUMN_HEADER}>
      <span>byte {byteIndex}</span>
      <span className={cn(distinctTag({ constant: dist.constant }))}>
        {dist.constant ? 'const' : `${String(dist.distinct)} vals`}
      </span>
    </div>
    <div className="flex flex-col gap-0.5">
      {dist.bars.map(([value, count]) => (
        <ByteBar key={value} value={value} count={count} dist={dist} />
      ))}
      {dist.distinct > MAX_BARS_PER_BYTE && (
        <div className="text-[10px] italic text-app-muted">
          + {String(dist.distinct - MAX_BARS_PER_BYTE)} more
        </div>
      )}
    </div>
  </div>
)

const ByteColumn = ({ byteIndex, counts }: ByteColumnProps) =>
  counts.size === 0 ? (
    <EmptyByteColumn byteIndex={byteIndex} />
  ) : (
    <FilledByteColumn byteIndex={byteIndex} dist={byteDistribution(counts)} />
  )

const formatByte = (value: number): string => `0x${hexByte(value)}`

const formatPct = (count: number, total: number): string => {
  if (total === 0) return '0 %'
  return `${((count / total) * 100).toFixed(0)} %`
}
