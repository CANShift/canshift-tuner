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

export const TimerFields = ({ widget, onChange }: ConfigFieldsProps) => {
  if (widget.config.type !== 'timer') return null
  const cfg = widget.config
  const source = cfg.source ?? DEFAULT_TIMER_SOURCE

  return (
    <>
      <PanelRow>
        <PanelField label="Source">
          <CompactSelect
            value={source}
            options={TIMER_SOURCES.map((value) => ({
              value,
              label: TIMER_SOURCE_LABELS[value],
            }))}
            onChange={(next) => {
              onChange({ config: { ...cfg, source: next as TimerSource } })
            }}
          />
        </PanelField>
        {source === 'elapsed' && (
          <PanelField label="Format">
            <CompactSelect
              value={cfg.format ?? 'mm:ss'}
              options={FORMATS}
              onChange={(format) => {
                onChange({ config: { ...cfg, format: format as 'mm:ss' | 'ss.mmm' } })
              }}
            />
          </PanelField>
        )}
      </PanelRow>
      {!isTouchInteractive(source) && (
        <p className="mt-1.5 text-[11px] leading-[1.5] text-ui-faint">{READOUT_NOTE}</p>
      )}
    </>
  )
}
