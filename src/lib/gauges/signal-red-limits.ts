import type { CriticalAlertDirection, SignalLimits } from '@canshift/core'

export interface RedLimit {
  direction: CriticalAlertDirection
  value: number
}

const primaryDirection = (limits: SignalLimits): CriticalAlertDirection =>
  limits.warningLevel !== undefined &&
  limits.dangerLevel !== undefined &&
  limits.warningLevel > limits.dangerLevel
    ? 'below'
    : 'above'

export const signalRedLimits = (limits: SignalLimits | undefined): RedLimit[] => {
  if (limits === undefined) return []
  const sides: { direction: CriticalAlertDirection; value: number | undefined }[] = [
    { direction: primaryDirection(limits), value: limits.dangerLevel },
    { direction: 'above', value: limits.highDangerLevel },
  ]
  return sides.filter((side): side is RedLimit => side.value !== undefined)
}
