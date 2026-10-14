import type { Widget } from '@canshift/core'
import { WidgetList } from '../WidgetList'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { useSignalStore } from '../../../stores/signal.store'
import { retypeWidget, type PaletteWidgetType } from '../../../lib/new-widget'
import { widgetLabel } from './widget-label'

export interface SidebarWidgetListProps {
  pageId: string
  widgets: readonly Widget[]
}

export const SidebarWidgetList = ({ pageId, widgets }: SidebarWidgetListProps) => {
  const selectedWidgetId = useDashboardStore((s) => s.selectedWidgetId)
  const selectWidget = useDashboardStore((s) => s.selectWidget)
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const signals = useSignalStore((s) => s.signals)

  const retype = (widgetId: string, type: string) => {
    const target = widgets.find((widget) => widget.id === widgetId)
    if (!target) return
    const patch = retypeWidget(target, type as PaletteWidgetType)
    if (patch !== null) updateWidget(pageId, widgetId, patch)
  }

  return (
    <WidgetList
      widgets={widgets}
      signals={signals}
      selectedId={selectedWidgetId}
      onSelect={selectWidget}
      onSignal={(widgetId, signal) => {
        updateWidget(pageId, widgetId, { signal })
      }}
      onType={retype}
      labelFor={widgetLabel}
    />
  )
}
