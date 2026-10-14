import { useCallback } from 'react'
import type { Widget } from '@canshift/core'

import { useDashboardConfig } from '../../hooks/useDashboardConfig'
import { useSignalStore } from '../../stores/signal.store'
import { useUndoToastStore } from '../../stores/undo-toast.store'
import { PageConfigPanel } from './property-panel/panels/page-config-panel'
import { WidgetEditorPanel } from './property-panel/panels/widget-editor-panel'

interface PropertyPanelProps {
  pageId: string
}

const NoConfig = () => (
  <div className="p-3">
    <p className="text-[11px] text-brand-neutral-500">No config loaded.</p>
  </div>
)

const useWidgetActions = (pageId: string, widgetId: string | undefined) => {
  const { updateWidget, removeWidget } = useDashboardConfig()
  const showUndoToast = useUndoToastStore((s) => s.showForLastAction)
  const removeWithToast = useCallback(
    (targetPageId: string, targetWidgetId: string) => {
      removeWidget(targetPageId, targetWidgetId)
      showUndoToast()
    },
    [removeWidget, showUndoToast]
  )
  const patch = useCallback(
    (p: Partial<Widget>) => {
      if (!widgetId) return
      updateWidget(pageId, widgetId, p)
    },
    [updateWidget, pageId, widgetId]
  )
  return { patch, removeWithToast }
}

const PropertyPanel = ({ pageId }: PropertyPanelProps) => {
  const { config, selectedWidgetId, addPage, removePage, setTargetProfile } = useDashboardConfig()
  const signals = useSignalStore((s) => s.signals)
  const page = config?.pages.find((p) => p.id === pageId)
  const widget = page?.widgets.find((w) => w.id === selectedWidgetId)
  const { patch, removeWithToast } = useWidgetActions(pageId, widget?.id)
  if (widget) {
    return (
      <WidgetEditorPanel
        pageId={pageId}
        widget={widget}
        signals={signals}
        patch={patch}
        onRemove={removeWithToast}
      />
    )
  }
  if (!page || !config) return <NoConfig />
  return (
    <PageConfigPanel
      config={config}
      setTargetProfile={setTargetProfile}
      addPage={addPage}
      removePage={removePage}
    />
  )
}

export default PropertyPanel
