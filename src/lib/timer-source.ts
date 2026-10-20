import type { TimerSource, UnitSystem } from '@canshift/core'
import { TIMER_SOURCE_KICKERS } from '@canshift/core'

export const DEFAULT_TIMER_SOURCE: TimerSource = 'elapsed'

export const TIMER_SOURCE_LABELS: Record<TimerSource, string> = {
  elapsed: 'Elapsed',
  lap: 'Current lap',
  best: 'Best lap',
  last: 'Last lap',
  lapCount: 'Lap count',
  delta: 'Delta to best',
  launchSprint: 'Launch to 100 km/h (60 mph)',
  launchStrip: 'Launch to 400 m (¼ mile)',
}

const DEMO_VALUES: Record<TimerSource, string> = {
  elapsed: '01:23',
  lap: '1:38.42',
  best: '1:36.07',
  last: '1:38.42',
  lapCount: '4',
  delta: '+0.31',
  launchSprint: '0:05.42',
  launchStrip: '0:13.87',
}

const DEMO_ELAPSED_SS_MMM = '12.847'

const DELTA_UNIT = 's'

export const timerUnit = (source: TimerSource | undefined): string =>
  source === 'delta' ? DELTA_UNIT : ''

export const timerKicker = (source: TimerSource | undefined, units: UnitSystem): string =>
  TIMER_SOURCE_KICKERS[source ?? DEFAULT_TIMER_SOURCE][units]

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
