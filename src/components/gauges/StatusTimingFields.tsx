import { TOP_BAR_TIMER_SOURCES } from '@canshift/core'
import { CompactSelect, PanelField } from '@/components/ui/form-field'
import { STRINGS } from '../../strings'
import type { StatusItem } from '../../lib/status-row'
import { TIMER_SOURCE_LABELS } from '../../lib/timer-source'
import { StatusNote, StatusSignalField, StatusTextField } from './StatusFieldControls'

const S = STRINGS.statusRow

type TimerStatusItem = Extract<StatusItem, { type: 'timer' }>
type FlagStatusItem = Extract<StatusItem, { type: 'flagWord' }>
type TopBarTimerSource = (typeof TOP_BAR_TIMER_SOURCES)[number]

const SOURCE_OPTIONS = TOP_BAR_TIMER_SOURCES.map((value) => ({
  value,
  label: TIMER_SOURCE_LABELS[value],
}))

export interface StatusTimerFieldsProps {
  item: TimerStatusItem
  onChange: (item: TimerStatusItem) => void
}

export const StatusTimerFields = ({ item, onChange }: StatusTimerFieldsProps) => (
  <>
    <PanelField label={S.source}>
      <CompactSelect
        value={item.source}
        options={SOURCE_OPTIONS}
        ariaLabel={S.source}
        onChange={(source) => {
          onChange({ ...item, source: source as TopBarTimerSource })
        }}
      />
    </PanelField>
    <StatusTextField
      label={S.prefix}
      value={item.text ?? ''}
      onChange={(text) => {
        onChange({ ...item, text })
      }}
    />
  </>
)

export interface StatusFlagFieldsProps {
  item: FlagStatusItem
  onChange: (item: FlagStatusItem) => void
}

export const StatusFlagFields = ({ item, onChange }: StatusFlagFieldsProps) => (
  <>
    <StatusSignalField
      label={S.signal}
      value={item.signal}
      onChange={(signal) => {
        onChange({ ...item, signal })
      }}
    />
    <StatusTextField
      label={S.onWord}
      value={item.text}
      onChange={(text) => {
        onChange({ ...item, text })
      }}
    />
    <StatusTextField
      label={S.offWord}
      value={item.offText}
      onChange={(offText) => {
        onChange({ ...item, offText })
      }}
    />
    <StatusNote>{S.stale}</StatusNote>
  </>
)
