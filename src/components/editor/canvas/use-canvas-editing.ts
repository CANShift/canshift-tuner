import { useRef, type RefObject } from 'react'
import type { PageConfig } from '@canshift/core'
import { useShallow } from 'zustand/react/shallow'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { useDragState } from '../../../hooks/useDragState'
import { useResizeState } from '../../../hooks/useResizeState'
import { useCanvasKeyboard } from '../../../hooks/useCanvasKeyboard'
import { useClipboardWidgets } from '../../../hooks/useClipboardWidgets'
import type { CanvasDialogs } from '../../../hooks/useCanvasDialogs'

export interface CanvasArea {
  width: number
  widgetAreaHeight: number
}

const useEditingActions = () =>
  useDashboardStore(
    useShallow((s) => ({
      selectWidget: s.selectWidget,
      selectWidgets: s.selectWidgets,
      removeWidgets: s.removeWidgets,
      nudgeWidgets: s.nudgeWidgets,
      copyWidgets: s.copyWidgets,
      pasteWidgets: s.pasteWidgets,
    }))
  )

const useCanvasShortcuts = (page: PageConfig, dialogs: CanvasDialogs): void => {
  const actions = useEditingActions()
  const kbdRef = useRef({ pageId: page.id, pageWidgets: page.widgets })
  kbdRef.current = { pageId: page.id, pageWidgets: page.widgets }
  useCanvasKeyboard({ ...actions, kbdRef, setShortcutsOpen: dialogs.setShortcutsOpen })
  useClipboardWidgets(actions)
}

const useDragHandle = (page: PageConfig, area: CanvasArea, scaleRef: RefObject<number>) => {
  const selectedWidgetIds = useDashboardStore((s) => s.selectedWidgetIds)
  const inputs = {
    pageId: page.id,
    pageWidgets: page.widgets,
    selectedWidgetIds,
    canvasW: area.width,
    widgetAreaH: area.widgetAreaHeight,
  }
  const dragInputsRef = useRef(inputs)
  dragInputsRef.current = inputs
  return useDragState({ dragInputsRef, zoomRef: scaleRef, scale: 1 })
}

const useResizeHandle = (page: PageConfig, area: CanvasArea, scaleRef: RefObject<number>) => {
  const inputsRef = useRef({ pageId: page.id, canvasW: area.width })
  inputsRef.current = { pageId: page.id, canvasW: area.width }
  return useResizeState({ inputsRef, scaleRef })
}

export const useCanvasEditing = (
  page: PageConfig,
  area: CanvasArea,
  scale: number,
  dialogs: CanvasDialogs
) => {
  const scaleRef = useRef(scale)
  scaleRef.current = scale
  useCanvasShortcuts(page, dialogs)
  return {
    onDragStart: useDragHandle(page, area, scaleRef),
    onResizeStart: useResizeHandle(page, area, scaleRef),
  }
}
