import { cn } from '@/lib/utils'
import type { SignalDef } from '@canshift/core'
import type { DisplayUnits } from '../../hooks/useDisplayUnits'

const PERCENT = 100
const DECIMALS = 1
const NO_VALUE = '—'

export interface LiveCardsProps {
  signals: readonly SignalDef[]
  units: DisplayUnits
  values: Record<string, number>
  selected: readonly string[]
  onToggle: (name: string) => void
}

const formatValue = (value: number | undefined): string => {
  if (value === undefined) return NO_VALUE
  return Number.isInteger(value) ? String(value) : value.toFixed(DECIMALS)
}

const fractionOf = (signal: SignalDef, value: number | undefined): number => {
  if (value === undefined) return 0
  const range = signal.max - signal.min || 1
  return Math.max(0, Math.min(1, (value - signal.min) / range))
}

export const LiveCards = ({ signals, values, units, selected, onToggle }: LiveCardsProps) => (
  <div className="grid gap-px border border-ui-line bg-ui-line [grid-template-columns:repeat(auto-fill,minmax(228px,1fr))]">
    {signals.map((signal) => {
      const value = values[signal.name]
      const on = selected.includes(signal.name)
      return (
        <button
          key={signal.name}
          type="button"
          onClick={() => {
            onToggle(signal.name)
          }}
          title={on ? 'Remove from the plot' : 'Add to the plot'}
          className={cn(
            'cursor-pointer border-0 p-[18px] text-left',
            on ? 'bg-ui-panel' : 'bg-ui-bg hover:bg-ui-panel'
          )}
        >
          <div className="mb-2 flex items-baseline gap-2.5">
            <span className="truncate font-mono text-[10px] tracking-[0.16em] text-ui-muted">
              {signal.name}
            </span>
            <span className="ml-auto shrink-0 font-mono text-[10px] text-ui-accent">
              {signal.canFrameId}
            </span>
          </div>
          <div className="font-mono text-[30px] leading-none tracking-[-0.02em] tabular-nums text-ui-ink">
            {formatValue(value === undefined ? undefined : units.valueOf(value, signal.unit))}
            <span className="text-[13px] tracking-normal text-ui-faint">
              {' '}
              {units.unitOf(signal.unit)}
            </span>
          </div>
          <div className="mt-3 h-[3px] bg-ui-line">
            <div
              className="h-full bg-ui-ink"
              // eslint-disable-next-line no-inline-style/no-inline-style
              style={{ width: `${String(Math.round(fractionOf(signal, value) * PERCENT))}%` }}
            />
          </div>
        </button>
      )
    })}
  </div>
)
