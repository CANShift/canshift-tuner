import type {
  ButtonWidgetConfig,
  GaugeWidgetConfig,
  GearWidgetConfig,
  GMeterWidgetConfig,
  Widget,
} from '@canshift/core'
import { G_METER, signalDisplayLabel } from '@canshift/core'

type KickerConfig = GaugeWidgetConfig | GearWidgetConfig | ButtonWidgetConfig | GMeterWidgetConfig

const KICKER_TYPES: ReadonlySet<string> = new Set(['gauge', 'gear', 'button', 'g_meter'])

const FIXED_KICKERS: Readonly<Partial<Record<Widget['type'], string>>> = {
  g_meter: G_METER.defaultKicker,
}

const kickerConfigOf = (widget: Widget): KickerConfig | null =>
  KICKER_TYPES.has(widget.config.type) ? (widget.config as KickerConfig) : null

export const carriesKicker = (widget: Widget): boolean => kickerConfigOf(widget) !== null

export const authoredKicker = (widget: Widget): string | undefined => {
  const kicker = kickerConfigOf(widget)?.kicker
  return kicker === undefined || kicker.length === 0 ? undefined : kicker
}

export const derivedKicker = (widget: Widget): string =>
  (FIXED_KICKERS[widget.type] ?? signalDisplayLabel(widget.signal)).toUpperCase()

export const shownKicker = (widget: Widget): string =>
  (authoredKicker(widget) ?? derivedKicker(widget)).toUpperCase()

export const withKicker = (widget: Widget, kicker: string): Widget['config'] | null => {
  const config = kickerConfigOf(widget)
  if (config === null) return null
  const { kicker: _previous, ...rest } = config
  return (kicker.length === 0 ? rest : { ...rest, kicker }) as Widget['config']
}
