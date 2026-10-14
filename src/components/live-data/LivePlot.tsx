import { useMemo } from 'react'
import type { LiveSample } from '../../hooks/useLiveSampler'
import { displayLabelForSignal } from '../../utils/signal-labels'
import { PLOT_VIEW_HEIGHT, PLOT_VIEW_WIDTH, buildSeries, type PlotSeries } from './live-plot-series'

const RANGE_DECIMALS = 1

export interface LivePlotProps {
  selected: readonly string[]
  samples: readonly LiveSample[]
  className?: string
}

const PlotLegend = ({ series }: { series: readonly PlotSeries[] }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ui-muted">
    {series.map((entry) => (
      <span key={entry.name} className="flex items-center gap-2">
        <svg aria-hidden="true" viewBox="0 0 8 8" className="size-2">
          <rect width="8" height="8" fill={entry.colour} />
        </svg>
        <span className="text-ui-ink">{displayLabelForSignal(entry.name)}</span>
        {entry.min.toFixed(RANGE_DECIMALS)} – {entry.max.toFixed(RANGE_DECIMALS)}
      </span>
    ))}
  </div>
)

const PlotLines = ({ series, className }: { series: readonly PlotSeries[]; className: string }) => (
  <svg
    viewBox={`0 0 ${String(PLOT_VIEW_WIDTH)} ${String(PLOT_VIEW_HEIGHT)}`}
    preserveAspectRatio="none"
    className={`block w-full ${className}`}
    fill="none"
    aria-label="Live signal plot"
  >
    {series.map((entry) => (
      <path
        key={entry.name}
        d={entry.path}
        stroke={entry.colour}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    ))}
  </svg>
)

export const LivePlot = ({ selected, samples, className = 'h-[190px]' }: LivePlotProps) => {
  const series = useMemo(
    () =>
      selected
        .map((name, index) => buildSeries(name, index, samples))
        .filter((entry): entry is PlotSeries => entry !== null),
    [selected, samples]
  )
  if (selected.length === 0) {
    return (
      <p className="py-6 text-center text-[12.5px] text-ui-muted">
        Tick a signal in the table to plot it.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2.5">
      <PlotLines series={series} className={className} />
      <PlotLegend series={series} />
    </div>
  )
}
