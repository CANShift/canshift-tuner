import { useState } from 'react'
import type { PageConfig, Widget } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { CompactSelect, PanelField } from '@/components/ui/form-field'
import { STRINGS } from '../../strings'
import { PALETTE_ITEMS, retypeWidget, type PaletteWidgetType } from '../../lib/new-widget'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useSignalStore } from '../../stores/signal.store'
import {
  CONFIG_FIELDS,
  DayModeField,
  useHexParser,
} from '../editor/property-panel/panels/widget-editor-panel'
import { ButtonColorsRow } from '../editor/property-panel/panels/button-colors-row'
import { SizeTokenPicker } from '../editor/property-panel/panels/size-token-picker'
import { UiIcon } from '../icons/UiIcons'

export interface MoreOptionsProps {
  page: PageConfig
  widget: Widget
}

const TYPE_OPTIONS = PALETTE_ITEMS.map((item) => ({ value: item.type, label: item.label }))

const TypeField = ({ widget, patch }: { widget: Widget; patch: (p: Partial<Widget>) => void }) => (
  <PanelField label={STRINGS.gauges.widgetType}>
    <CompactSelect
      value={widget.type}
      options={TYPE_OPTIONS}
      onChange={(next) => {
        const change = retypeWidget(widget, next as PaletteWidgetType)
        if (change !== null) patch(change)
      }}
    />
  </PanelField>
)

const Fields = ({ page, widget }: MoreOptionsProps) => {
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const signals = useSignalStore((s) => s.signals)
  const { colorError, safeParseHex } = useHexParser()
  const patch = (next: Partial<Widget>) => {
    updateWidget(page.id, widget.id, next)
  }
  const ConfigFields = CONFIG_FIELDS[widget.type]
  return (
    <div className="flex flex-col gap-1 rounded-[12px] border border-app-border bg-app-bg p-3">
      <TypeField widget={widget} patch={patch} />
      <SizeTokenPicker widget={widget} onChange={patch} />
      {ConfigFields !== undefined && (
        <ConfigFields
          widget={widget}
          onChange={patch}
          signalDef={signals.find((s) => s.name === widget.signal)}
        />
      )}
      <ButtonColorsRow
        widget={widget}
        colorError={colorError}
        safeParseHex={safeParseHex}
        onChange={patch}
      />
      <DayModeField widget={widget} patch={patch} />
    </div>
  )
}

export const MoreOptions = (props: MoreOptionsProps) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ghost"
        className="self-start px-2 text-[15px] text-app-secondary"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <UiIcon name={open ? 'chevronDown' : 'chevronRight'} />
        {open ? STRINGS.gauges.fewerOptions : STRINGS.gauges.moreOptions}
      </Button>
      {open && <Fields {...props} />}
    </div>
  )
}
