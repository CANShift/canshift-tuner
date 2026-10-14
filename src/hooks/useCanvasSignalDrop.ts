import { useCallback } from 'react'
import type { Widget } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { useRebindFlashStore } from '../stores/rebind-flash.store'
import { defaultWidgetForSignal, SIGNAL_DRAG_MIME } from '../utils/default-widget'
import { autoPlace } from '../utils/layout'

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

const widgetForDrop = (name: string, pageWidgets: readonly Widget[]): Widget | null => {
  const signal = useSignalStore.getState().signals.find((s) => s.name === name)
  if (!signal) return null
  const widget = defaultWidgetForSignal(signal)
  const slot = autoPlace(
    { colSpan: widget.layout.colSpan, rowSpan: widget.layout.rowSpan },
    pageWidgets.map((w) => w.layout)
  )
  return slot ? widget : null
}

const useWidgetSignalDrop = ({ pageId, templateLocked }: UseCanvasSignalDropOptions) => {
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const flashWidget = useRebindFlashStore((s) => s.flash)
  return useCallback(
    (widget: Widget, signalName: string) => {
      if (templateLocked || widget.signal === signalName) return
      updateWidget(pageId, widget.id, { signal: signalName })
      flashWidget(widget.id)
    },
    [templateLocked, updateWidget, pageId, flashWidget]
  )
}

const useSignalDrop = ({ pageId, pageWidgets, templateLocked }: UseCanvasSignalDropOptions) => {
  const addWidget = useDashboardStore((s) => s.addWidget)
  return useCallback(
    (e: React.DragEvent) => {
      const name = e.dataTransfer.getData(SIGNAL_DRAG_MIME)
      if (!name || templateLocked) return
      e.preventDefault()
      const widget = widgetForDrop(name, pageWidgets)
      if (widget) addWidget(pageId, widget)
    },
    [templateLocked, addWidget, pageId, pageWidgets]
  )
}

export const useCanvasSignalDrop = (
  options: UseCanvasSignalDropOptions
): CanvasSignalDropHandlers => {
  const { templateLocked } = options
  const handleSignalDragOver = useCallback(
    (e: React.DragEvent) => {
      if (templateLocked || !e.dataTransfer.types.includes(SIGNAL_DRAG_MIME)) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    [templateLocked]
  )
  return {
    handleWidgetSignalDrop: useWidgetSignalDrop(options),
    handleSignalDragOver,
    handleSignalDrop: useSignalDrop(options),
  }
}
