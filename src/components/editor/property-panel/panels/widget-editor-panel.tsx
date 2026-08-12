import { useCallback, useState } from 'react'
import type { HexColor, SignalDef, Widget, WidgetType } from '@canshift/core'
import { HexColorSchema } from '@canshift/core'

import { useLogStore } from '../../../../stores/log.store'
import { Checkbox } from '@/components/ui/checkbox'
import { IconTrash } from '../../../icons/Icon'
import { ButtonFields } from '../button-fields'
import { GaugeFields } from '../gauge-fields'
import { ShiftLightFields } from '../shift-light-fields'
import { ConfigFieldsProps } from '../shared'
import { CompactSelect, PanelField, SectionLabel } from '@/components/ui/form-field'
import { ButtonColorsRow } from './button-colors-row'
import { SizeTokenPicker } from './size-token-picker'

const DELETE_BUTTON = [
  'flex cursor-pointer items-center gap-1 border border-solid border-status-danger-dim',
  'bg-transparent px-[7px] py-[3px] text-[11px] text-status-danger',
].join(' ')

const DANGER_FG = 'hsl(var(--status-danger))'

const CONFIG_FIELDS: Partial<
  Record<WidgetType, (props: ConfigFieldsProps) => React.JSX.Element | null>
> = {
  gauge: GaugeFields,
  button: ButtonFields,
  shift_light: ShiftLightFields,
}

const SIGNAL_HIDDEN_TYPES = new Set<WidgetType>(['button', 'timer', 'image'])
const SIZE_HIDDEN_TYPES = new Set<WidgetType>(['gauge'])

interface WidgetEditorPanelProps {
  pageId: string
  widget: Widget
  signals: SignalDef[]
  patch: (p: Partial<Widget>) => void
  onRemove: (pageId: string, widgetId: string) => void
}

export const WidgetEditorPanel = ({
  pageId,
  widget,
  signals,
  patch,
  onRemove,
}: WidgetEditorPanelProps) => {
  const pushLog = useLogStore((s) => s.push)
  const [colorError, setColorError] = useState<string | null>(null)

  const safeParseHex = useCallback(
    (raw: string): HexColor | null => {
      const result = HexColorSchema.safeParse(raw)
      if (result.success) {
        setColorError(null)
        return result.data
      }
      const message = `Invalid color value "${raw}" — expected #RRGGBB hex literal.`
      setColorError(message)
      pushLog('warn', message)
      return null
    },
    [pushLog]
  )

  const ConfigFields = CONFIG_FIELDS[widget.type]
  const boundSignalDef = signals.find((s) => s.name === widget.signal)

  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-brand-neutral-600">
            Properties
          </div>
          <div className="mt-0.5 text-[12px] font-semibold text-status-danger">{widget.type}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            onRemove(pageId, widget.id)
          }}
          title="Delete widget (Del)"
          className={DELETE_BUTTON}
        >
          <IconTrash size={11} color={DANGER_FG} />
          Delete
        </button>
      </div>

      <PanelField label="ID">
        <div className="py-[3px] font-mono text-[10px] text-brand-neutral-600">{widget.id}</div>
      </PanelField>

      {!SIZE_HIDDEN_TYPES.has(widget.type) && <SizeTokenPicker widget={widget} onChange={patch} />}

      {!SIGNAL_HIDDEN_TYPES.has(widget.type) && (
        <PanelField label="Signal">
          <CompactSelect
            value={widget.signal || ''}
            options={[
              { value: '', label: '— none —' },
              ...signals.map((s) => ({
                value: s.name,
                label: s.unit ? `${s.name} — ${s.unit}` : s.name,
              })),
            ]}
            onChange={(newSignal) => {
              const signalDef = signals.find((s) => s.name === newSignal)
              const p: Partial<Widget> = { signal: newSignal }
              if (signalDef && widget.config.type === 'gauge') {
                p.config = {
                  ...widget.config,
                  suffix: signalDef.unit,
                  minValue: signalDef.min,
                  maxValue: signalDef.max,
                  ...(signalDef.dangerLevel !== undefined && {
                    dangerLevel: signalDef.dangerLevel,
                  }),
                }
              }
              patch(p)
            }}
          />
        </PanelField>
      )}

      <PanelField label="Follow day-mode text colour">
        <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-brand-neutral-600">
          <Checkbox
            checked={widget.style.respectDayMode !== false}
            onCheckedChange={(checked) => {
              const nextStyle = { ...widget.style }
              if (checked === true) {
                delete nextStyle.respectDayMode
              } else {
                nextStyle.respectDayMode = false
              }
              patch({ style: nextStyle })
            }}
          />
          When off, the widget keeps its bespoke text colour in day mode
        </label>
      </PanelField>

      <ButtonColorsRow
        widget={widget}
        colorError={colorError}
        safeParseHex={safeParseHex}
        onChange={patch}
      />

      {ConfigFields && (
        <>
          <div className="mb-1.5 mt-1">
            <SectionLabel>{widget.type} config</SectionLabel>
          </div>
          <ConfigFields widget={widget} onChange={patch} signalDef={boundSignalDef} />
        </>
      )}
    </div>
  )
}
