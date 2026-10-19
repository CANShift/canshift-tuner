import type { Widget, WidgetConfig } from '@canshift/core'

export type WidgetFields = Omit<Widget, 'type' | 'config'>

export type WidgetPatch = Partial<WidgetFields> & { config?: WidgetConfig }

export const pairWidget = (fields: WidgetFields, config: WidgetConfig): Widget =>
  ({ ...fields, type: config.type, config }) as Widget

export const patchWidget = (widget: Widget, patch: WidgetPatch): Widget => {
  const { config, ...fields } = patch
  return pairWidget({ ...widget, ...fields }, config ?? widget.config)
}
