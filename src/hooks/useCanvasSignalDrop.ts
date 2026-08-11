import { useCallback } from 'react'
import type { Widget } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { useRebindFlashStore } from '../stores/rebind-flash.store'
import { defaultWidgetForSignal, SIGNAL_DRAG_MIME } from '../utils/default-widget'
import { autoPlace } from '../utils/layout'
import { captureFlowEvent } from '../lib/posthog'

export interface UseCanvasSignalDropOptions {
  pageId: string
  pageWidgets: readonly Widget[]
  templateLocked: boolean
}

export interface CanvasSignalDropHandlers {
  handleWidgetSignalDrop: (widget: Widget, signalName: string) => void
  handleSignalDragOver: (e: React.DragEvent) => void
  handleSignalDrop: (e: React.DragEvent) => void
}

export const useCanvasSignalDrop = ({
  pageId,
  pageWidgets,
  templateLocked,
}: UseCanvasSignalDropOptions): CanvasSignalDropHandlers => {
  const addWidget = useDashboardStore((s) => s.addWidget)
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const flashWidget = useRebindFlashStore((s) => s.flash)

  const handleWidgetSignalDrop = useCallback(
    (widget: Widget, signalName: string) => {
      if (templateLocked || widget.signal === signalName) return
      updateWidget(pageId, widget.id, { signal: signalName })
      flashWidget(widget.id)
      captureFlowEvent('signal_rebound', { target: 'widget' })
    },
    [templateLocked, updateWidget, pageId, flashWidget]
  )

  const handleSignalDragOver = useCallback(
    (e: React.DragEvent) => {
      if (templateLocked || !e.dataTransfer.types.includes(SIGNAL_DRAG_MIME)) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    [templateLocked]
  )

  const handleSignalDrop = useCallback(
    (e: React.DragEvent) => {
      const name = e.dataTransfer.getData(SIGNAL_DRAG_MIME)
      if (!name || templateLocked) return
      e.preventDefault()
      const signal = useSignalStore.getState().signals.find((s) => s.name === name)
      if (!signal) return
      const widget = defaultWidgetForSignal(signal)
      const slot = autoPlace(
        { colSpan: widget.layout.colSpan, rowSpan: widget.layout.rowSpan },
        pageWidgets.map((w) => w.layout)
      )
      if (!slot) return
      addWidget(pageId, widget)
      captureFlowEvent('signal_bound', { target: 'canvas', widgetType: widget.type })
    },
    [templateLocked, addWidget, pageId, pageWidgets]
  )

  return { handleWidgetSignalDrop, handleSignalDragOver, handleSignalDrop }
}
