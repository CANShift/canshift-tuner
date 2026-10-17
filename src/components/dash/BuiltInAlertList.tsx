import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { formatSignalValue } from '../../lib/format'
import {
  builtInAlertLimits,
  type AlertRule,
  type BuiltInAlertLimit,
} from '../../lib/built-in-alerts'
import { useDisplayUnits, type DisplayUnits } from '../../hooks/useDisplayUnits'
import { useSignalStore } from '../../stores/signal.store'

const D = STRINGS.dash

const DIRECTION_WORDS = { above: STRINGS.gauges.above, below: STRINGS.gauges.below }

const RULE_SEPARATOR = ' · '

const ruleText = (rule: AlertRule, unit: string, units: DisplayUnits): string =>
  [
    DIRECTION_WORDS[rule.direction],
    formatSignalValue(units.valueOf(rule.value, unit)),
    units.unitOf(unit),
  ]
    .filter((part) => part.length > 0)
    .join(' ')

const limitText = (limit: BuiltInAlertLimit, units: DisplayUnits): string =>
  limit.rules.length === 0
    ? D.notSet
    : limit.rules.map((rule) => ruleText(rule, limit.unit, units)).join(RULE_SEPARATOR)

export const BuiltInAlertList = () => {
  const signals = useSignalStore((s) => s.signals)
  const units = useDisplayUnits()
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[15px] font-bold">{D.builtInAlerts}</h3>
      <ul className="flex flex-col">
        {builtInAlertLimits(signals).map((limit) => (
          <li
            key={limit.source}
            className="flex min-h-10 items-center justify-between gap-3 border-b border-app-divider text-[15px] last:border-b-0"
          >
            <span>{signalName(limit.signal)}</span>
            <span className="text-right text-app-secondary">{limitText(limit, units)}</span>
          </li>
        ))}
      </ul>
      <p className="text-[13px] leading-snug text-app-secondary">{D.builtInHint}</p>
    </div>
  )
}
