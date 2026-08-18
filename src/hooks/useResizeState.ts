import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import type { Widget } from '@canshift/core'
import { LAYOUT_GRID } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'

const MIN_SPAN = 1

interface ResizeState {
  pageId: string
  widgetId: string
  startX: number
  startSpan: number
  startCol: number
  lastSpan: number
}

export interface ResizeInputs {
  pageId: string
  canvasW: number
}

export interface UseResizeStateOptions {
  inputsRef: RefObject<ResizeInputs>
  scaleRef: RefObject<number>
}

const trackPitch = (areaSize: number, tracks: number): number =>
  (areaSize - 2 * LAYOUT_GRID.FRAME_PADDING + LAYOUT_GRID.GUTTER) / tracks

export const useResizeState = ({
  inputsRef,
  scaleRef,
}: UseResizeStateOptions): ((e: ReactPointerEvent, widget: Widget) => void) => {
  const moveWidget = useDashboardStore((s) => s.moveWidget)
  const beginDrag = useDashboardStore((s) => s.beginDrag)
  const stateRef = useRef<ResizeState | null>(null)

  return useCallback(
    (e: ReactPointerEvent, widget: Widget) => {
      const inputs = inputsRef.current
      if (!inputs) return
      e.preventDefault()
      e.stopPropagation()

      stateRef.current = {
        pageId: inputs.pageId,
        widgetId: widget.id,
        startX: e.clientX,
        startSpan: widget.layout.colSpan,
        startCol: widget.layout.col,
        lastSpan: widget.layout.colSpan,
      }

      const pitch = trackPitch(inputs.canvasW, LAYOUT_GRID.COLUMNS)
      let began = false

      const onMove = (ev: PointerEvent) => {
        const state = stateRef.current
        if (!state) return
        const scale = scaleRef.current ?? 1
        const deltaCols = Math.round((ev.clientX - state.startX) / (pitch * scale))
        const maxSpan = LAYOUT_GRID.COLUMNS - state.startCol
        const nextSpan = Math.min(maxSpan, Math.max(MIN_SPAN, state.startSpan + deltaCols))
        if (nextSpan === state.lastSpan) return
        if (!began) {
          beginDrag(state.pageId, [state.widgetId])
          began = true
        }
        state.lastSpan = nextSpan
        moveWidget(state.pageId, state.widgetId, { colSpan: nextSpan })
      }

      const onUp = () => {
        stateRef.current = null
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [inputsRef, scaleRef, moveWidget, beginDrag]
  )
}
