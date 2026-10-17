import type { CriticalAlert, Widget } from '@canshift/core'

export const alertDrivenBy = (
  alerts: readonly CriticalAlert[],
  widget: Pick<Widget, 'signal'>
): CriticalAlert | undefined =>
  widget.signal === '' ? undefined : alerts.find((alert) => alert.signal === widget.signal)
