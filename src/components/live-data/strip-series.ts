import type { LiveSample } from '../../hooks/useLiveSampler'

export const STRIP_VIEW_WIDTH = 1000
export const STRIP_VIEW_HEIGHT = 100

const TICK_STEPS_S = [1, 2, 5, 10, 15, 30, 60] as const
const MAX_TICKS = 6
const LONGEST_STEP_S = 60

export interface TimeWindow {
  start: number
  end: number
}

export interface StripSeries {
  path: string
  min: number
  max: number
  latest: number
}

export interface TimeTick {
  offset: number
  label: string
}

interface StripPoint {
  t: number
  value: number
}

export const timeWindowOf = (samples: readonly LiveSample[]): TimeWindow => {
  const start = samples[0]?.t ?? 0
  return { start, end: samples[samples.length - 1]?.t ?? start }
}

const pointsOf = (name: string, samples: readonly LiveSample[]): StripPoint[] =>
  samples.flatMap((sample) => {
    const value = sample.values[name]
    return value === undefined ? [] : [{ t: sample.t, value }]
  })

const xOf = (t: number, window: TimeWindow): number =>
  ((t - window.start) / (window.end - window.start || 1)) * STRIP_VIEW_WIDTH

const yOf = (value: number, min: number, span: number): number =>
  STRIP_VIEW_HEIGHT - ((value - min) / span) * STRIP_VIEW_HEIGHT

const pathOf = (points: readonly StripPoint[], window: TimeWindow, min: number, max: number) => {
  const span = max - min || 1
  return points
    .map((point, i) => {
      const command = i === 0 ? 'M' : 'L'
      return `${command}${xOf(point.t, window).toFixed(1)} ${yOf(point.value, min, span).toFixed(1)}`
    })
    .join(' ')
}

export const buildStrip = (
  name: string,
  samples: readonly LiveSample[],
  window: TimeWindow
): StripSeries | null => {
  const points = pointsOf(name, samples)
  const last = points[points.length - 1]
  if (points.length < 2 || last === undefined) return null
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return { path: pathOf(points, window, min, max), min, max, latest: last.value }
}

const tickStep = (duration: number): number =>
  TICK_STEPS_S.find((step) => duration / step <= MAX_TICKS) ?? LONGEST_STEP_S

const tickLabel = (secondsAgo: number): string =>
  secondsAgo === 0 ? 'now' : `−${String(secondsAgo)} s`

export const timeTicks = (window: TimeWindow): TimeTick[] => {
  const duration = window.end - window.start
  if (duration <= 0) return []
  const step = tickStep(duration)
  const count = Math.floor(duration / step)
  return Array.from({ length: count + 1 }, (_, i) => ({
    offset: 1 - (i * step) / duration,
    label: tickLabel(i * step),
  }))
}
