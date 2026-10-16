import type { DisplayUnits } from '../../hooks/useDisplayUnits'
import { formatSignalValue } from '../../lib/format'
import { displayLabelForSignal } from '../../utils/signal-labels'
import { STRIP_VIEW_HEIGHT, STRIP_VIEW_WIDTH, type StripSeries } from './strip-series'

export interface SignalStripProps {
  name: string
  unit: string
  series: StripSeries | null
  units: DisplayUnits
}

interface StripReadout {
  value: string
  range: string
}

const readoutOf = (series: StripSeries | null, unit: string, units: DisplayUnits): StripReadout => {
  if (series === null) return { value: formatSignalValue(undefined), range: '' }
  const shown = (value: number) => formatSignalValue(units.valueOf(value, unit))
  return { value: shown(series.latest), range: `${shown(series.min)} – ${shown(series.max)}` }
}

const StripTrace = ({ series }: { series: StripSeries | null }) => (
  <div className="relative min-h-0 flex-1">
    <svg
      viewBox={`0 0 ${String(STRIP_VIEW_WIDTH)} ${String(STRIP_VIEW_HEIGHT)}`}
      preserveAspectRatio="none"
      className="absolute inset-0 size-full overflow-visible text-app-text"
      fill="none"
      aria-hidden="true"
    >
      {series && (
        <path
          d={series.path}
          stroke="currentColor"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  </div>
)

export const SignalStrip = ({ name, unit, series, units }: SignalStripProps) => {
  const readout = readoutOf(series, unit, units)
  return (
    <section
      aria-label={`${displayLabelForSignal(name)} trace`}
      className="flex h-[72px] flex-none flex-col gap-1 border-b border-app-divider px-3 py-1.5 md:px-4 min-[1100px]:h-auto min-[1100px]:min-h-[96px] min-[1100px]:flex-1 min-[1100px]:py-2.5"
    >
      <header className="flex items-baseline gap-3">
        <span className="text-[11px] font-extrabold tracking-[0.18em] text-app-muted uppercase">
          {displayLabelForSignal(name)}
        </span>
        <span className="font-mono text-[18px] leading-none tabular-nums text-app-text min-[1100px]:text-[26px]">
          {readout.value}
          <span className="ml-1 text-[12px] text-app-muted">{units.unitOf(unit)}</span>
        </span>
        <span className="ml-auto font-mono text-[11.5px] tabular-nums text-app-muted">
          {readout.range}
        </span>
      </header>
      <StripTrace series={series} />
    </section>
  )
}
