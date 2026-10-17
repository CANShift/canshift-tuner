import type { Widget } from '@canshift/core'
import { STRINGS } from '../../strings'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { formatSignalValue } from '../../lib/format'
import { signalRedLimits, type RedLimit } from '../../lib/gauges/signal-red-limits'
import { useSignalStore } from '../../stores/signal.store'

export interface SignalLimitsNoteProps {
  widget: Widget
}

const G = STRINGS.gauges

const DIRECTION_WORD = { above: G.above, below: G.below }

const useRedSides = (signal: string): string => {
  const units = useDisplayUnits()
  const def = useSignalStore((s) => s.signals.find((candidate) => candidate.name === signal))
  const unit = def?.unit ?? ''
  const side = ({ direction, value }: RedLimit): string =>
    `${DIRECTION_WORD[direction]} ${formatSignalValue(units.valueOf(value, unit))} ${units.unitOf(unit)}`.trim()
  return signalRedLimits(def).map(side).join(` ${G.or} `)
}

export const SignalLimitsNote = ({ widget }: SignalLimitsNoteProps) => {
  const sides = useRedSides(widget.signal)
  if (widget.config.type !== 'gauge' || sides.length === 0) return null
  return <p className="m-0 text-xs text-app-muted">{G.alsoRed(sides)}</p>
}
