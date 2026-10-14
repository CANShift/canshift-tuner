import { useCallback, useState, type RefObject } from 'react'
import { useDashboardStore } from '../stores/dashboard.store'
import { followPointer } from '../lib/follow-pointer'
import {
  bandBetween,
  framePoint,
  isDeliberateBand,
  widgetsInBand,
  type FramePoint,
  type RubberBand,
} from '../lib/rubber-band'

export interface UseRubberBandSelectionOptions {
  containerRef: RefObject<HTMLDivElement | null>
  effScale: number
  pageId: string
  selectWidgets: (widgetIds: string[]) => void
}

export interface UseRubberBandSelectionResult {
  rubberBand: RubberBand | null
  startRubberBand: (e: React.PointerEvent) => void
}

const selectInBand = (pageId: string, band: RubberBand, select: (ids: string[]) => void) => {
  const config = useDashboardStore.getState().config
  if (!config || !isDeliberateBand(band)) return
  const ids = widgetsInBand(config, pageId, band)
  if (ids.length > 0) select(ids)
}

interface BandTracking {
  container: RefObject<HTMLDivElement | null>
  scale: number
  onBand: (band: RubberBand | null) => void
  onRelease: (band: RubberBand) => void
}

const trackBand = (start: FramePoint, tracking: BandTracking) => {
  const bandTo = (ev: MouseEvent): RubberBand | null => {
    const container = tracking.container.current
    return container ? bandBetween(start, framePoint(container, ev, tracking.scale)) : null
  }
  followPointer('mouse', {
    onMove: (ev) => {
      const band = bandTo(ev)
      if (band) tracking.onBand(band)
    },
    onUp: (ev) => {
      const band = bandTo(ev)
      tracking.onBand(null)
      if (band) tracking.onRelease(band)
    },
  })
}

export const useRubberBandSelection = ({
  containerRef,
  effScale,
  pageId,
  selectWidgets,
}: UseRubberBandSelectionOptions): UseRubberBandSelectionResult => {
  const [rubberBand, setRubberBand] = useState<RubberBand | null>(null)

  const startRubberBand = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current) return
      trackBand(framePoint(containerRef.current, e.nativeEvent, effScale), {
        container: containerRef,
        scale: effScale,
        onBand: setRubberBand,
        onRelease: (band) => {
          selectInBand(pageId, band, selectWidgets)
        },
      })
    },
    [containerRef, pageId, selectWidgets, effScale]
  )

  return { rubberBand, startRubberBand }
}
