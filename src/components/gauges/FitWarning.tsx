import type { Widget } from '@canshift/core'
import { UiIcon } from '../icons/UiIcons'
import { STRINGS } from '../../strings'
import { useUnfitWidgets } from '../../hooks/useUnfitWidgets'
import { fitReading } from '../../lib/value-fit'

export interface FitWarningProps {
  widget: Widget
}

export const FitWarning = ({ widget }: FitWarningProps) => {
  const fit = useUnfitWidgets().get(widget.id)
  if (fit === undefined) return null
  return (
    <p
      role="status"
      className="m-0 flex items-start gap-3 rounded-[12px] bg-app-warning-bg p-3.5 text-[15px] leading-snug text-app-warning-ink"
    >
      <UiIcon name="warning" />
      {STRINGS.gauges.tooWide(fitReading(fit))}
    </p>
  )
}
