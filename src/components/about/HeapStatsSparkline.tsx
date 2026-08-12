import type { HeapStatsEntry } from '../../stores/device.store'

export interface HeapStatsSparklineProps {
  history: HeapStatsEntry[]
}

const SPARKLINE_WIDTH = 360
const SPARKLINE_HEIGHT = 56

export const HeapStatsSparkline = ({ history }: HeapStatsSparklineProps) => {
  if (history.length < 2) {
    return (
      <div className="flex h-14 items-center justify-center text-[11px] text-text-muted">
        Collecting…
      </div>
    )
  }

  const largestSeries = history.map((e) => e.largestInternal)
  const freeSeries = history.map((e) => e.freeInternal)
  const maxVal = Math.max(...freeSeries, 1)

  return (
    <svg
      width={SPARKLINE_WIDTH}
      height={SPARKLINE_HEIGHT}
      viewBox={`0 0 ${String(SPARKLINE_WIDTH)} ${String(SPARKLINE_HEIGHT)}`}
      role="img"
      aria-label="Heap-stats history sparkline"
      className="block"
    >
      <path
        d={buildPath(freeSeries, maxVal)}
        fill="none"
        stroke="hsl(var(--text-muted))"
        strokeWidth={1}
        strokeOpacity={0.6}
      />
      <path
        d={buildPath(largestSeries, maxVal)}
        fill="none"
        stroke="hsl(var(--brand-accent))"
        strokeWidth={1.5}
      />
    </svg>
  )
}

const buildPath = (values: number[], maxVal: number): string => {
  const stepX = values.length > 1 ? SPARKLINE_WIDTH / (values.length - 1) : 0
  return values
    .map((v, i) => {
      const x = i * stepX
      const y = SPARKLINE_HEIGHT - (v / maxVal) * SPARKLINE_HEIGHT
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}
