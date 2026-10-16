import { Link } from 'react-router-dom'
import type { Widget } from '@canshift/core'
import { STRINGS } from '../../strings'
import { drivesAlert } from '../../lib/gauges/alert-link'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { useSignalStore } from '../../stores/signal.store'
import { formatSignalValue } from '../../lib/format'
import { UiIcon } from '../icons/UiIcons'

export interface AlertLinkProps {
  widget: Widget
}

const useThresholdText = (signal: string, firesAt: number | undefined): string => {
  const units = useDisplayUnits()
  const unit = useSignalStore((s) => s.signals.find((c) => c.name === signal)?.unit ?? '')
  if (firesAt === undefined) return ''
  return `${formatSignalValue(units.valueOf(firesAt, unit))} ${units.unitOf(unit)}`.trim()
}

const DIRECTION_WORD = { above: STRINGS.gauges.above, below: STRINGS.gauges.below }

export const AlertLink = ({ widget }: AlertLinkProps) => {
  const alert = useDashboardStore((s) => s.config?.criticalAlert)
  const threshold = useThresholdText(widget.signal, alert?.firesAt)
  if (!drivesAlert(alert, widget)) return null
  return (
    <Link
      to="/dash"
      className="flex min-h-12 items-center gap-2.5 rounded-control bg-app-primary px-3 py-2 text-sm leading-tight text-white no-underline"
    >
      <UiIcon name="fullScreen" className="size-[18px]" />
      <span className="flex-1">
        {STRINGS.gauges.alsoTriggers(DIRECTION_WORD[alert.direction], threshold)}
      </span>
      <span className="whitespace-nowrap font-semibold">{STRINGS.gauges.changeInDash} ›</span>
    </Link>
  )
}
