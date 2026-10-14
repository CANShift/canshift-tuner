import type { Widget } from '@canshift/core'
import { SelectedWidgetEditor } from '../SelectedWidgetEditor'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { useDangerThreshold } from './useDangerThreshold'
import { widgetLabel } from './widget-label'

export interface SidebarSelectedEditorProps {
  pageId: string
  widgets: readonly Widget[]
  selected: Widget
}

const useRename = (pageId: string, widget: Widget) => {
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  return (name: string) => {
    if (widget.config.type !== 'button') return
    updateWidget(pageId, widget.id, { config: { ...widget.config, kicker: name } })
  }
}

export const SidebarSelectedEditor = ({
  pageId,
  widgets,
  selected,
}: SidebarSelectedEditorProps) => {
  const reorderWidget = useDashboardStore((s) => s.reorderWidget)
  const danger = useDangerThreshold(pageId, selected)
  const rename = useRename(pageId, selected)
  const index = widgets.indexOf(selected)

  return (
    <SelectedWidgetEditor
      widget={selected}
      name={widgetLabel(selected)}
      nameEditable={selected.config.type === 'button'}
      onName={rename}
      onMove={(direction) => {
        reorderWidget(pageId, selected.id, direction)
      }}
      canMoveUp={index > 0}
      canMoveDown={index >= 0 && index < widgets.length - 1}
      dangerAt={danger.at}
      dangerBelow={danger.below}
      dangerEditable={danger.editable}
      onDangerAt={danger.setAt}
      onDangerBelow={danger.setBelow}
    />
  )
}
