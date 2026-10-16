import type { CriticalAlert, Widget } from '@canshift/core'

export const drivesAlert = (
  alert: CriticalAlert | undefined,
  widget: Pick<Widget, 'signal'>
): alert is CriticalAlert =>
  alert !== undefined && widget.signal !== '' && alert.signal === widget.signal
