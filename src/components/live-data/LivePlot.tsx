import { useMemo } from 'react'
import type { SignalDef } from '@canshift/core'
import { cn } from '@/lib/utils'
import type { LiveSample } from '../../hooks/useLiveSampler'

const VIEW_WIDTH = 1000
const VIEW_HEIGHT = 100
const SERIES_COLOURS = ['#ec3013', '#00cc2a', '#ff8800', '#5588ff', '#c060ff', '#00c8c8'] as const
const RANGE_DECIMALS = 1

export interface LivePlotProps {
  signals: readonly SignalDef[]
  selected: readonly string[]
  onToggle: (name: string) => void
  samples: readonly LiveSample[]
  windowSeconds: number
  onStepWindow: (direction: 1 | -1) => void
}

interface Series {
  name: string
  colour: string
  path: string
  min: number
  max: number
}

const colourFor = (index: number): string =>
  SERIES_COLOURS[index % SERIES_COLOURS.length] ?? SERIES_COLOURS[0]

const buildSeries = (
  name: string,
  index: number,
  samples: readonly LiveSample[]
): Series | null => {
  const points = samples.flatMap((sample) => {
    const value = sample.values[name]
    return value === undefined ? [] : [{ t: sample.t, value }]
  })
  if (points.length < 2) return null

  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const first = points[0]?.t ?? 0
  const last = points[points.length - 1]?.t ?? first
  const duration = last - first || 1

  const path = points
    .map((point, i) => {
      const x = ((point.t - first) / duration) * VIEW_WIDTH
      const y = VIEW_HEIGHT - ((point.value - min) / span) * VIEW_HEIGHT
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  return { name, colour: colourFor(index), path, min, max }
}

export const LivePlot = ({
  signals,
  selected,
  onToggle,
  samples,
  windowSeconds,
  onStepWindow,
}: LivePlotProps) => {
  const series = useMemo(
    () => selected.map((name, index) => buildSeries(name, index, samples)).filter(Boolean),
    [selected, samples]
  ) as Series[]

  return (
    <div className="mt-6 grid grid-cols-[minmax(0,1fr)_190px] border border-ui-line">
      <div className="border-r border-ui-line">
        <div className="flex items-baseline gap-3.5 border-b border-ui-line px-[18px] py-3 font-mono text-[10.5px] tracking-[0.16em] text-ui-muted">
          <span className="text-ui-ink">PLOT</span>
          <span>
            {selected.length} signal{selected.length === 1 ? '' : 's'}
          </span>
          <span className="ml-auto tracking-[0.08em] text-ui-faint">
            click a card to add it to the plot
          </span>
          <div className="ml-3.5 flex items-center gap-2.5">
            <StepButton
              label="Longer window"
              onClick={() => {
                onStepWindow(-1)
              }}
            >
              −
            </StepButton>
            <StepButton
              label="Shorter window"
              onClick={() => {
                onStepWindow(1)
              }}
            >
              +
            </StepButton>
            <span className="min-w-[42px] text-right tracking-[0.08em] text-ui-ink">
              {windowSeconds} s
            </span>
          </div>
        </div>
        <div className="px-[18px] pb-4 pt-3.5">
          {series.length === 0 ? (
            <div className="grid h-[190px] place-items-center font-mono text-[12.5px] text-ui-faint">
              Pick a signal to plot it.
            </div>
          ) : (
            <>
              <svg
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                preserveAspectRatio="none"
                className="block h-[190px] w-full"
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
              <div className="mt-3.5 flex flex-wrap gap-[18px] border-t border-ui-line pt-3 font-mono text-[11px] text-ui-muted">
                {series.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="block size-2"
                      // eslint-disable-next-line no-inline-style/no-inline-style
                      style={{ background: entry.colour }}
                    />
                    <span className="text-ui-ink">{entry.name}</span>
                    <span>
                      {entry.min.toFixed(RANGE_DECIMALS)} – {entry.max.toFixed(RANGE_DECIMALS)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="border-b border-ui-line px-3.5 py-3 font-mono text-[10.5px] tracking-[0.16em] text-ui-muted">
          SIGNALS
        </div>
        <div className="max-h-[260px] flex-1 overflow-y-auto py-1.5">
          {signals.map((signal) => {
            const on = selected.includes(signal.name)
            return (
              <button
                key={signal.name}
                type="button"
                onClick={() => {
                  onToggle(signal.name)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-3.5 py-1.5 text-left font-mono text-[12px]',
                  on ? 'text-ui-ink' : 'text-ui-muted hover:bg-ui-panel'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn('block size-2 border border-ui-line-strong')}
                  // eslint-disable-next-line no-inline-style/no-inline-style
                  style={on ? { background: colourFor(selected.indexOf(signal.name)) } : undefined}
                />
                <span className="truncate">{signal.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface StepButtonProps {
  label: string
  onClick: () => void
  children: string
}

const StepButton = ({ label, onClick, children }: StepButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className="grid size-6 cursor-pointer place-items-center border border-ui-line-strong bg-transparent font-mono text-[14px] leading-none text-ui-ink hover:bg-ui-panel"
  >
    {children}
  </button>
)
