import { useRef, type Dispatch, type RefObject, type SetStateAction } from 'react'
import type { PageConfig } from '@canshift/core'
import { isDeliberateBand, type RubberBand } from '../lib/rubber-band'
import { swipeIntent, type SwipeIntent } from '../lib/swipe-intent'

export interface UseSwipeGesturesOptions {
  containerRef: RefObject<HTMLDivElement | null>
  pageId: string
  pages: readonly PageConfig[]
  rubberBand: RubberBand | null
  diagOpen: boolean
  settingsOpen: boolean
  setDiagOpen: Dispatch<SetStateAction<boolean>>
  selectWidget: (widgetId: string | null) => void
  selectPage: (pageId: string | null) => void
  startRubberBand: (e: React.PointerEvent) => void
}

export interface UseSwipeGesturesResult {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
}

interface SwipeStart {
  startX: number
  startY: number
}

const isBackground = (target: HTMLElement, container: HTMLDivElement | null): boolean =>
  target === container || target.closest('[data-widget]') === null

const pageStep = (options: UseSwipeGesturesOptions, step: number) => () => {
  const currentIdx = options.pages.findIndex((p) => p.id === options.pageId)
  const nextPage = options.pages[currentIdx + step]
  if (nextPage) options.selectPage(nextPage.id)
}

const intentActions = (options: UseSwipeGesturesOptions): Record<SwipeIntent, () => void> => ({
  'open-diag': () => options.setDiagOpen(true),
  'close-diag': () => options.setDiagOpen(false),
  'next-page': pageStep(options, 1),
  'previous-page': pageStep(options, -1),
  none: () => undefined,
})

export const useSwipeGestures = (options: UseSwipeGesturesOptions): UseSwipeGesturesResult => {
  const swipeRef = useRef<SwipeStart | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isBackground(e.target as HTMLElement, options.containerRef.current)) return
    swipeRef.current = { startX: e.clientX, startY: e.clientY }
    options.selectWidget(null)
    options.startRubberBand(e)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipeRef.current
    swipeRef.current = null
    if (!start || (options.rubberBand && isDeliberateBand(options.rubberBand))) return
    const travel = { dx: e.clientX - start.startX, dy: e.clientY - start.startY }
    intentActions(options)[swipeIntent(travel, options)]()
  }

  return { onPointerDown, onPointerUp }
}
