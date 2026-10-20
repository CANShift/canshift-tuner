import { STRING_CAPS } from '@canshift/core'
import { STRINGS } from '../../strings'
import {
  canConvert,
  declaredUnitOf,
  withConversion,
  withShowUnit,
  withSignal,
  type ValueStatusItem,
} from '../../lib/status-units'
import { useSignalStore } from '../../stores/signal.store'
import {
  StatusNote,
  StatusSignalField,
  StatusSwitchRow,
  StatusTextField,
} from './StatusFieldControls'

const S = STRINGS.statusRow

export interface StatusValueFieldsProps {
  item: ValueStatusItem
  onChange: (item: ValueStatusItem) => void
}

const PrefixField = ({ item, onChange }: StatusValueFieldsProps) => {
  if (item.type !== 'signalMax') return null
  return (
    <StatusTextField
      label={S.prefix}
      value={item.text}
      onChange={(text) => {
        onChange({ ...item, text })
      }}
    />
  )
}

const UnitSwitches = ({ item, onChange }: StatusValueFieldsProps) => {
  const signals = useSignalStore((s) => s.signals)
  const declared = declaredUnitOf(signals, item.signal)
  if (!canConvert(declared)) return <StatusNote>{S.noPair}</StatusNote>
  const converting = item.unit !== undefined
  return (
    <>
      <StatusSwitchRow
        label={S.convertUnits}
        checked={converting}
        onChange={(convert) => {
          onChange(withConversion(item, convert, declared))
        }}
      />
      <StatusSwitchRow
        label={S.showUnit}
        checked={item.showUnit ?? false}
        disabled={!converting}
        onChange={(show) => {
          onChange(withShowUnit(item, show))
        }}
      />
    </>
  )
}

export const StatusValueFields = ({ item, onChange }: StatusValueFieldsProps) => {
  const signals = useSignalStore((s) => s.signals)
  return (
    <>
      <StatusSignalField
        label={S.signal}
        value={item.signal}
        onChange={(signal) => {
          onChange(withSignal(item, signal, declaredUnitOf(signals, signal)))
        }}
      />
      <PrefixField item={item} onChange={onChange} />
      <StatusTextField
        label={S.format}
        value={item.format ?? ''}
        maxLength={STRING_CAPS.TOPBAR_FORMAT}
        onChange={(format) => {
          onChange({ ...item, format })
        }}
      />
      <UnitSwitches item={item} onChange={onChange} />
    </>
  )
}
