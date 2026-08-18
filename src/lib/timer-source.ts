import type { TimerSource } from '@canshift/core'

export const DEFAULT_TIMER_SOURCE: TimerSource = 'elapsed'

export const TIMER_SOURCE_LABELS: Record<TimerSource, string> = {
  elapsed: 'Elapsed',
  lap: 'Current lap',
  best: 'Best lap',
  last: 'Last lap',
  lapCount: 'Lap count',
  delta: 'Delta to best',
}

const KICKERS: Record<TimerSource, string> = {
  elapsed: 'TIMER',
  lap: 'LAP',
  best: 'BEST',
  last: 'LAST',
  lapCount: 'LAPS',
  delta: 'DELTA',
}

const PLACEHOLDERS: Record<TimerSource, string> = {
  elapsed: '00:00',
  lap: '--:--',
  best: '--:--',
  last: '--:--',
  lapCount: '0',
  delta: '--',
}

const DEMO_VALUES: Record<TimerSource, string> = {
  elapsed: '01:23',
  lap: '1:38.42',
  best: '1:36.07',
  last: '1:38.42',
  lapCount: '4',
  delta: '+0.31',
}

const DEMO_ELAPSED_SS_MMM = '12.847'

export const timerKicker = (source: TimerSource | undefined): string =>
  KICKERS[source ?? DEFAULT_TIMER_SOURCE]

export const timerPlaceholder = (source: TimerSource | undefined): string =>
  PLACEHOLDERS[source ?? DEFAULT_TIMER_SOURCE]

export const timerDemoValue = (
  source: TimerSource | undefined,
  format: 'mm:ss' | 'ss.mmm' | undefined
): string => {
  const resolved = source ?? DEFAULT_TIMER_SOURCE
  if (resolved === 'elapsed' && format === 'ss.mmm') return DEMO_ELAPSED_SS_MMM
  return DEMO_VALUES[resolved]
}

export const isTouchInteractive = (source: TimerSource | undefined): boolean =>
  (source ?? DEFAULT_TIMER_SOURCE) === 'elapsed'
