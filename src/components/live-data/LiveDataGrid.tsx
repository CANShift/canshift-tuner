import { cva } from 'class-variance-authority'
import type { SignalDef } from '@canshift/core'
import { cn } from '@/lib/utils'
import { LIVE_DATA_CELL, LIVE_DATA_GRID } from './grid-shape'

export interface LiveDataGridProps {
  signals: readonly SignalDef[]
  values: Record<string, number>
}

const DANGER_FRACTION = 0.9

const CELL_LABEL = [
  'overflow-hidden text-ellipsis whitespace-nowrap',
  'text-[10px] font-extrabold tracking-[0.18em] text-brand-neutral-600',
].join(' ')

const CELL_VALUE = 'font-mono text-[44px] leading-[1.1] tabular-nums'

const tinted = cva('', {
  variants: {
    danger: { true: 'text-brand-accent', false: 'text-brand-text' },
  },
  defaultVariants: { danger: false },
})

const barFill = cva('h-full', {
  variants: {
    danger: { true: 'bg-brand-accent', false: 'bg-brand-text' },
  },
  defaultVariants: { danger: false },
})

const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1)

const fractionOf = (signal: SignalDef, raw: number | undefined): number => {
  if (raw === undefined) return 0
  const range = signal.max - signal.min || 1
  return Math.max(0, Math.min(1, (raw - signal.min) / range))
}

export const LiveDataGrid = ({ signals, values }: LiveDataGridProps) => (
  <div className={LIVE_DATA_GRID}>
    {signals.map((signal) => {
      const raw = values[signal.name]
      const fraction = fractionOf(signal, raw)
      const danger = fraction >= DANGER_FRACTION
      return (
        <div key={signal.name} className={LIVE_DATA_CELL}>
          <span className={CELL_LABEL}>{signal.name.replace(/_/g, ' ').toUpperCase()}</span>
          <div className="flex items-baseline gap-1.5">
            <span className={cn(CELL_VALUE, tinted({ danger }))}>
              {raw !== undefined ? formatValue(raw) : '—'}
            </span>
            <span className="font-mono text-[13px] text-brand-neutral-600">{signal.unit}</span>
          </div>
          <div className="h-1 bg-brand-neutral-300">
            <div
              className={cn(barFill({ danger }))}
              // eslint-disable-next-line no-inline-style/no-inline-style
              style={{ width: `${String(Math.round(fraction * 100))}%` }}
            />
          </div>
        </div>
      )
    })}
  </div>
)
