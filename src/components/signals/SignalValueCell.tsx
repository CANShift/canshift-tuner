import { displayUnit } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import type { DisplayUnits } from '../../hooks/useDisplayUnits'
import { UNIT_SYSTEM_OPTIONS } from '../../constants/units'

const DECIMALS = 1
const NO_VALUE = '—'

const formatValue = (value: number | undefined): string => {
  if (value === undefined) return NO_VALUE
  return Number.isInteger(value) ? String(value) : value.toFixed(DECIMALS)
}

interface UnitProps {
  signal: SignalDef
  units: DisplayUnits
}

const UnitChoice = ({ signal, units }: UnitProps) => {
  if (!units.hasPair(signal.unit)) {
    return <span className="text-[12px] text-ui-muted">{signal.unit}</span>
  }
  return (
    <select
      value={units.system}
      aria-label={`Unit for ${signal.name}`}
      onChange={(e) => {
        units.setSystem(e.target.value as DisplayUnits['system'])
      }}
      className="border border-transparent bg-transparent font-mono text-[12px] text-ui-muted hover:border-ui-line-strong focus:border-ui-ink"
    >
      {UNIT_SYSTEM_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {displayUnit(signal.unit, option.value)}
        </option>
      ))}
    </select>
  )
}

export interface SignalValueCellProps extends UnitProps {
  value: number | undefined
  className?: string
}

export const SignalValueCell = ({ signal, units, value, className }: SignalValueCellProps) => {
  const shown = value === undefined ? undefined : units.valueOf(value, signal.unit)
  return (
    <span className={`flex items-baseline justify-end gap-1.5 ${className ?? ''}`}>
      <span className="font-mono tabular-nums">{formatValue(shown)}</span>
      <UnitChoice signal={signal} units={units} />
    </span>
  )
}
