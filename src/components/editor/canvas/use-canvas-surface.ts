import type { MouseEvent, RefObject } from 'react'
import type { PageConfig } from '@canshift/core'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { useRubberBandSelection } from '../../../hooks/useRubberBandSelection'
import { useSwipeGestures } from '../../../hooks/useSwipeGestures'
import { useCanvasSignalDrop } from '../../../hooks/useCanvasSignalDrop'
import type { CanvasDialogs } from '../../../hooks/useCanvasDialogs'

export interface CanvasSurfaceInputs {
  page: PageConfig
  pages: readonly PageConfig[]
  surfaceRef: RefObject<HTMLDivElement | null>
  scale: number
  dialogs: CanvasDialogs
}

const usePointerGestures = ({ page, pages, surfaceRef, scale, dialogs }: CanvasSurfaceInputs) => {
  const selectWidget = useDashboardStore((s) => s.selectWidget)
  const selectWidgets = useDashboardStore((s) => s.selectWidgets)
  const selectPage = useDashboardStore((s) => s.selectPage)
  const { rubberBand, startRubberBand } = useRubberBandSelection({
    containerRef: surfaceRef,
    effScale: scale,
    pageId: page.id,
    selectWidgets,
  })
  const swipe = useSwipeGestures({
    containerRef: surfaceRef,
    pageId: page.id,
    pages,
    rubberBand,
    diagOpen: dialogs.diagOpen,
    settingsOpen: dialogs.settingsOpen,
    setDiagOpen: dialogs.setDiagOpen,
    selectWidget,
    selectPage,
    startRubberBand,
  })
  return { rubberBand, ...swipe }
}

const isTemplateLocked = (page: PageConfig): boolean => (page.template ?? 'custom') !== 'custom'

export const useCanvasSurface = (inputs: CanvasSurfaceInputs) => {
  const { page } = inputs
  const selectWidget = useDashboardStore((s) => s.selectWidget)
  const { rubberBand, onPointerDown, onPointerUp } = usePointerGestures(inputs)
  const drop = useCanvasSignalDrop({
    pageId: page.id,
    pageWidgets: page.widgets,
    templateLocked: isTemplateLocked(page),
  })
  const surfaceProps = {
    onPointerDown,
    onPointerUp,
    onDragOver: drop.handleSignalDragOver,
    onDrop: drop.handleSignalDrop,
    onMouseDown: (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-widget]') === null) selectWidget(null)
    },
  }
  return { rubberBand, surfaceProps, onSignalDrop: drop.handleWidgetSignalDrop }
}
