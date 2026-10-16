import type { CSSProperties } from 'react'
import { timeTicks, type TimeWindow } from './strip-series'

export interface TimeAxisProps {
  window: TimeWindow
}

const tickPosition = (offset: number): CSSProperties => {
  const percent = `${String(offset * 100)}%`
  return { left: percent, transform: `translateX(-${percent})` }
}

export const TimeAxis = ({ window }: TimeAxisProps) => (
  <div className="flex-none px-3 md:px-4" aria-hidden="true">
    <div className="relative h-6 font-mono text-[11px] text-app-muted tabular-nums">
      {timeTicks(window).map((tick) => (
        <span
          key={tick.label}
          className="absolute top-1.5 whitespace-nowrap"
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={tickPosition(tick.offset)}
        >
          {tick.label}
        </span>
      ))}
    </div>
  </div>
)
