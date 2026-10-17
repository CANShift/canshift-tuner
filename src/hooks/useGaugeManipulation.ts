import { useRef, type MouseEvent, type PointerEvent } from 'react'
import type { PageConfig, Widget } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useDragState, type DragInputs } from './useDragState'
import { useResizeState, type ResizeInputs } from './useResizeState'
import { useClipboardWidgets } from './useClipboardWidgets'

export interface PreviewArea {
  scale: number
  areaWidth: number
  areaHeight: number
}

export interface GaugeManipulation {
  onPress: (event: MouseEvent, widget: Widget) => void
  onResizeStart: (event: PointerEvent, widget: Widget) => void
}

const useLatest = <T>(value: T) => {
  const ref = useRef(value)
  ref.current = value
  return ref
}

const useDragInputs = (page: PageConfig, area: PreviewArea) => {
  const selectedWidgetIds = useDashboardStore((s) => s.selectedWidgetIds)
  return useLatest<DragInputs>({
    pageId: page.id,
    pageWidgets: page.widgets,
    selectedWidgetIds,
    canvasW: area.areaWidth,
    widgetAreaH: area.areaHeight,
  })
}

const selectForPress = (event: MouseEvent, widget: Widget): boolean => {
  const store = useDashboardStore.getState()
  if (event.shiftKey) {
    store.toggleWidgetSelection(widget.id)
    return false
  }
  if (!store.selectedWidgetIds.includes(widget.id)) store.selectWidget(widget.id)
  return true
}

export const useGaugeManipulation = (
  page: PageConfig,
  area: PreviewArea,
  enabled: boolean
): GaugeManipulation => {
  const scaleRef = useLatest(area.scale)
  const dragInputsRef = useDragInputs(page, area)
  const resizeInputsRef = useLatest<ResizeInputs>({ pageId: page.id, canvasW: area.areaWidth })
  const startDrag = useDragState({ dragInputsRef, zoomRef: scaleRef, scale: 1 })
  const onResizeStart = useResizeState({ inputsRef: resizeInputsRef, scaleRef })
  useClipboardWidgets({ pageId: page.id, enabled })
  return {
    onPress: (event, widget) => {
      if (event.button !== 0) return
      if (selectForPress(event, widget)) startDrag(event, widget)
    },
    onResizeStart,
  }
}
