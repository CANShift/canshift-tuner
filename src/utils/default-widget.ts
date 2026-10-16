import { HexColorSchema, WIDGET_ZONE_COLORS } from '@canshift/core'

export const SIGNAL_DRAG_MIME = 'application/x-canshift-signal'
export const SIGNAL_CONSUMING_TYPES: ReadonlySet<string> = new Set([
  'gauge',
  'warning',
  'gear',
  'shift_light',
])

export const DEFAULT_WIDGET_STYLE = {
  primaryColor: HexColorSchema.parse(WIDGET_ZONE_COLORS.danger),
  secondaryColor: HexColorSchema.parse('#333333'),
  warningColor: HexColorSchema.parse(WIDGET_ZONE_COLORS.warning),
  criticalColor: HexColorSchema.parse('#FF0000'),
  textColor: HexColorSchema.parse('#FFFFFF'),
}
