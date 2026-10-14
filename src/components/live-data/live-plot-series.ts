import type { LiveSample } from '../../hooks/useLiveSampler'

export const PLOT_VIEW_WIDTH = 1000
export const PLOT_VIEW_HEIGHT = 100

const SERIES_COLOURS = ['#ec3013', '#00cc2a', '#ff8800', '#5588ff', '#c060ff', '#00c8c8'] as const

export interface PlotSeries {
  name: string
  colour: string
  path: string
  min: number
  max: number
}

interface PlotPoint {
  t: number
  value: number
}

export const colourFor = (index: number): string =>
  SERIES_COLOURS[index % SERIES_COLOURS.length] ?? SERIES_COLOURS[0]

const pointsOf = (name: string, samples: readonly LiveSample[]): PlotPoint[] =>
  samples.flatMap((sample) => {
    const value = sample.values[name]
    return value === undefined ? [] : [{ t: sample.t, value }]
  })

const pathOf = (points: readonly PlotPoint[], min: number, span: number): string => {
  const first = points[0]?.t ?? 0
  const duration = (points[points.length - 1]?.t ?? first) - first || 1
  return points
    .map((point, i) => {
      const x = ((point.t - first) / duration) * PLOT_VIEW_WIDTH
      const y = PLOT_VIEW_HEIGHT - ((point.value - min) / span) * PLOT_VIEW_HEIGHT
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export const buildSeries = (
  name: string,
  index: number,
  samples: readonly LiveSample[]
): PlotSeries | null => {
  const points = pointsOf(name, samples)
  if (points.length < 2) return null
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return { name, colour: colourFor(index), path: pathOf(points, min, max - min || 1), min, max }
}
