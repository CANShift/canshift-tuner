import { useCallback, useMemo, type MouseEvent as ReactMouseEvent, type RefObject } from 'react'
import type { DisplayTier, Widget } from '@canshift/core'
import { useDisplayTier } from './useDisplayTier'
import { useDashboardStore } from '../stores/dashboard.store'
import type { DashboardState } from '../stores/dashboard/types'
import {
  dragDelta,
  draggedSet,
  leftStart,
  placeDragged,
  trackPitch,
  type DraggedSet,
  type PlacedWidget,
} from '../lib/drag-geometry'
import { followPointer } from '../lib/follow-pointer'

export interface DragInputs {
  pageId: string
  pageWidgets: readonly Widget[]
  selectedWidgetIds: readonly string[]
  canvasW: number
  widgetAreaH: number
}

export interface UseDragStateOptions {
  dragInputsRef: RefObject<DragInputs>
  zoomRef: RefObject<number>
  scale: number
}

type DragActions = Pick<
  DashboardState,
  'moveWidget' | 'moveWidgets' | 'resolveWidgetCollisions' | 'beginDrag'
>

interface DragSession {
  primaryId: string
  pageId: string
  startX: number
  startY: number
  dragged: DraggedSet
  began: boolean
}

interface DragContext {
  actions: DragActions
  tier: DisplayTier
  pitch: { col: number; row: number }
  effectiveScale: () => number
}

const useDragActions = (): DragActions => {
  const moveWidget = useDashboardStore((s) => s.moveWidget)
  const moveWidgets = useDashboardStore((s) => s.moveWidgets)
  const resolveWidgetCollisions = useDashboardStore((s) => s.resolveWidgetCollisions)
  const beginDrag = useDashboardStore((s) => s.beginDrag)
  return useMemo(
    () => ({ moveWidget, moveWidgets, resolveWidgetCollisions, beginDrag }),
    [moveWidget, moveWidgets, resolveWidgetCollisions, beginDrag]
  )
}

const sessionFor = (e: ReactMouseEvent, widget: Widget, inputs: DragInputs): DragSession => ({
  primaryId: widget.id,
  pageId: inputs.pageId,
  startX: e.clientX,
  startY: e.clientY,
  dragged: draggedSet(widget, inputs.pageWidgets, inputs.selectedWidgetIds),
  began: false,
})

const pitchFor = (inputs: DragInputs, tier: DisplayTier) => ({
  col: trackPitch(inputs.canvasW, tier.columns),
  row: trackPitch(inputs.widgetAreaH, tier.rows),
})

const applyPlacement = (session: DragSession, placed: PlacedWidget[], actions: DragActions) => {
  if (session.dragged.isMulti) {
    actions.moveWidgets(session.pageId, placed)
    return
  }
  const first = placed[0]
  if (!first) return
  actions.moveWidget(session.pageId, session.primaryId, { col: first.col, row: first.row })
}

const startOnceMoved = (session: DragSession, placed: PlacedWidget[], actions: DragActions) => {
  if (session.began) return true
  if (!leftStart(placed, session.dragged.widgets)) return false
  session.began = true
  actions.beginDrag(
    session.pageId,
    session.dragged.widgets.map((w) => w.id)
  )
  return true
}

const moveSession = (session: DragSession, ev: MouseEvent, ctx: DragContext) => {
  const scale = ctx.effectiveScale()
  const pitch = { col: ctx.pitch.col * scale, row: ctx.pitch.row * scale }
  const travel = { dx: ev.clientX - session.startX, dy: ev.clientY - session.startY }
  const delta = dragDelta(travel, pitch, session.dragged, ctx.tier)
  const placed = placeDragged(session.dragged.widgets, delta, ctx.tier)
  if (!startOnceMoved(session, placed, ctx.actions)) return
  applyPlacement(session, placed, ctx.actions)
}

const endSession = (session: DragSession, actions: DragActions) => {
  if (!session.began || session.dragged.isMulti) return
  actions.resolveWidgetCollisions(session.pageId, session.primaryId)
}

const runDrag = (session: DragSession, ctx: DragContext) => {
  followPointer('mouse', {
    onMove: (ev) => {
      moveSession(session, ev, ctx)
    },
    onUp: () => {
      endSession(session, ctx.actions)
    },
  })
}

export const useDragState = ({
  dragInputsRef,
  zoomRef,
  scale,
}: UseDragStateOptions): ((e: ReactMouseEvent, widget: Widget) => void) => {
  const tier = useDisplayTier()
  const actions = useDragActions()

  return useCallback(
    (e: ReactMouseEvent, widget: Widget) => {
      const inputs = dragInputsRef.current
      if (!inputs) return
      runDrag(sessionFor(e, widget, inputs), {
        actions,
        tier,
        pitch: pitchFor(inputs, tier),
        effectiveScale: () => scale * (zoomRef.current ?? 1),
      })
    },
    [dragInputsRef, zoomRef, scale, actions, tier]
  )
}
