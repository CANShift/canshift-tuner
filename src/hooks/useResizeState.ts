import { useCallback, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import type { Widget } from '@canshift/core'
import { useDisplayTier } from './useDisplayTier'
import { useDashboardStore } from '../stores/dashboard.store'
import type { DashboardState } from '../stores/dashboard/types'
import { resizedSpan, trackPitch } from '../lib/drag-geometry'
import { followPointer } from '../lib/follow-pointer'

export interface ResizeInputs {
  pageId: string
  canvasW: number
}

export interface UseResizeStateOptions {
  inputsRef: RefObject<ResizeInputs>
  scaleRef: RefObject<number>
}

interface ResizeSession {
  pageId: string
  widgetId: string
  startX: number
  startSpan: number
  startCol: number
  lastSpan: number
  began: boolean
}

interface ResizeContext {
  actions: Pick<DashboardState, 'moveWidget' | 'beginDrag'>
  pitch: number
  columns: number
  scale: () => number
}

const resizeTo = (session: ResizeSession, ev: MouseEvent, ctx: ResizeContext) => {
  const deltaCols = Math.round((ev.clientX - session.startX) / (ctx.pitch * ctx.scale()))
  const nextSpan = resizedSpan(session.startSpan, session.startCol, deltaCols, ctx.columns)
  if (nextSpan === session.lastSpan) return
  if (!session.began) {
    ctx.actions.beginDrag(session.pageId, [session.widgetId])
    session.began = true
  }
  session.lastSpan = nextSpan
  ctx.actions.moveWidget(session.pageId, session.widgetId, { colSpan: nextSpan })
}

const sessionFor = (e: ReactPointerEvent, widget: Widget, pageId: string): ResizeSession => ({
  pageId,
  widgetId: widget.id,
  startX: e.clientX,
  startSpan: widget.layout.colSpan,
  startCol: widget.layout.col,
  lastSpan: widget.layout.colSpan,
  began: false,
})

export const useResizeState = ({
  inputsRef,
  scaleRef,
}: UseResizeStateOptions): ((e: ReactPointerEvent, widget: Widget) => void) => {
  const tier = useDisplayTier()
  const moveWidget = useDashboardStore((s) => s.moveWidget)
  const beginDrag = useDashboardStore((s) => s.beginDrag)

  return useCallback(
    (e: ReactPointerEvent, widget: Widget) => {
      const inputs = inputsRef.current
      if (!inputs) return
      e.preventDefault()
      e.stopPropagation()
      const session = sessionFor(e, widget, inputs.pageId)
      const ctx: ResizeContext = {
        actions: { moveWidget, beginDrag },
        pitch: trackPitch(inputs.canvasW, tier.columns),
        columns: tier.columns,
        scale: () => scaleRef.current ?? 1,
      }
      followPointer('pointer', {
        onMove: (ev) => resizeTo(session, ev, ctx),
        onUp: () => undefined,
      })
    },
    [inputsRef, scaleRef, moveWidget, beginDrag, tier]
  )
}
