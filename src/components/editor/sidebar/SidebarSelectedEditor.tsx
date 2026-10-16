import type { Widget } from '@canshift/core'
import { SelectedWidgetEditor } from '../SelectedWidgetEditor'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { carriesKicker, withKicker } from '../../../lib/widget-kicker'
import { useGaugeThresholds } from '../../../hooks/useGaugeThresholds'
import { widgetLabel } from './widget-label'

export interface SidebarSelectedEditorProps {
  pageId: string
  widgets: readonly Widget[]
  selected: Widget
}

const useRename = (pageId: string, widget: Widget) => {
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  return (name: string) => {
    const config = withKicker(widget, name)
    if (config === null) return
    updateWidget(pageId, widget.id, { config })
  }
}

export const SidebarSelectedEditor = ({
  pageId,
  widgets,
  selected,
}: SidebarSelectedEditorProps) => {
  const reorderWidget = useDashboardStore((s) => s.reorderWidget)
  const thresholds = useGaugeThresholds(pageId, selected)
  const rename = useRename(pageId, selected)
  const index = widgets.indexOf(selected)

  return (
    <SelectedWidgetEditor
      widget={selected}
      name={widgetLabel(selected)}
      nameEditable={carriesKicker(selected)}
      onName={rename}
      onMove={(direction) => {
        reorderWidget(pageId, selected.id, direction)
      }}
      canMoveUp={index > 0}
      canMoveDown={index >= 0 && index < widgets.length - 1}
      thresholds={thresholds}
    />
  )
}
