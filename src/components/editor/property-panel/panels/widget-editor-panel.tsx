import { useCallback, useState } from 'react'
import type { HexColor, Widget, WidgetType } from '@canshift/core'
import { HexColorSchema } from '@canshift/core'

import { useLogStore } from '../../../../stores/log.store'
import { Checkbox } from '@/components/ui/checkbox'
import { ButtonFields } from '../button-fields'
import { GaugeFields } from '../gauge-fields'
import { ShiftLightFields } from '../shift-light-fields'
import { TimerFields } from '../timer-fields'
import { WarningFields } from '../warning-fields'
import { ImageFields } from '../image-fields'
import { ConfigFieldsProps } from '../shared'
import { PanelField } from '@/components/ui/form-field'

export const CONFIG_FIELDS: Partial<
  Record<WidgetType, (props: ConfigFieldsProps) => React.JSX.Element | null>
> = {
  gauge: GaugeFields,
  button: ButtonFields,
  shift_light: ShiftLightFields,
  timer: TimerFields,
  warning: WarningFields,
  image: ImageFields,
}

export const SIGNAL_HIDDEN_TYPES = new Set<WidgetType>(['button', 'timer', 'image'])

interface DayModeFieldProps {
  widget: Widget
  patch: (p: Partial<Widget>) => void
}

export const dayModeStyle = (style: Widget['style'], follow: boolean): Widget['style'] => {
  const { respectDayMode: _, ...rest } = style
  return follow ? rest : { ...rest, respectDayMode: false }
}

export const useHexParser = () => {
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
  return { colorError, safeParseHex }
}

export const DayModeField = ({ widget, patch }: DayModeFieldProps) => (
  <PanelField label="Follow day-mode text colour">
    <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-brand-neutral-600">
      <Checkbox
        checked={widget.style.respectDayMode !== false}
        onCheckedChange={(checked) => {
          patch({ style: dayModeStyle(widget.style, checked === true) })
        }}
      />
      When off, the widget keeps its bespoke text colour in day mode
    </label>
  </PanelField>
)
