import { TIMER_SOURCES } from '@canshift/core'
import type { TimerSource } from '@canshift/core'
import { ConfigFieldsProps } from './shared'
import { CompactSelect, PanelField, PanelRow } from '@/components/ui/form-field'
import {
  DEFAULT_TIMER_SOURCE,
  TIMER_SOURCE_LABELS,
  isTouchInteractive,
} from '../../../lib/timer-source'

const FORMATS = [
  { value: 'mm:ss', label: 'MM:SS' },
  { value: 'ss.mmm', label: 'SS.mmm' },
]

const READOUT_NOTE = 'A readout — only the elapsed timer answers a touch on the device.'

type TimerConfig = Extract<ConfigFieldsProps['widget']['config'], { type: 'timer' }>
type TimerFormat = NonNullable<TimerConfig['format']>

interface TimerFieldProps {
  cfg: TimerConfig
  onChange: ConfigFieldsProps['onChange']
}

const SourceField = ({ cfg, source, onChange }: TimerFieldProps & { source: TimerSource }) => (
  <PanelField label="Source">
    <CompactSelect
      value={source}
      options={TIMER_SOURCES.map((value) => ({ value, label: TIMER_SOURCE_LABELS[value] }))}
      onChange={(next) => {
        onChange({ config: { ...cfg, source: next as TimerSource } })
      }}
    />
  </PanelField>
)

const FormatField = ({ cfg, onChange }: TimerFieldProps) => (
  <PanelField label="Format">
    <CompactSelect
      value={cfg.format ?? 'mm:ss'}
      options={FORMATS}
      onChange={(format) => {
        onChange({ config: { ...cfg, format: format as TimerFormat } })
      }}
    />
  </PanelField>
)

export const TimerFields = ({ widget, onChange }: ConfigFieldsProps) => {
  if (widget.config.type !== 'timer') return null
  const cfg = widget.config
  const source = cfg.source ?? DEFAULT_TIMER_SOURCE
  return (
    <>
      <PanelRow>
        <SourceField cfg={cfg} source={source} onChange={onChange} />
        {source === 'elapsed' && <FormatField cfg={cfg} onChange={onChange} />}
      </PanelRow>
      {!isTouchInteractive(source) && (
        <p className="mt-1.5 text-[11px] leading-normal text-app-muted">{READOUT_NOTE}</p>
      )}
    </>
  )
}
