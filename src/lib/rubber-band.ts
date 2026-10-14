import { resolveGridRect, resolveScreenProfile } from '@canshift/core'
import type { DashboardConfig, GridRect, PageConfig } from '@canshift/core'

export const RB_THRESHOLD = 4

export interface RubberBand {
  x: number
  y: number
  w: number
  h: number
}

export interface FramePoint {
  x: number
  y: number
}

const rectsIntersect = (a: GridRect, b: GridRect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

export const framePoint = (container: HTMLElement, ev: MouseEvent, scale: number): FramePoint => {
  const rect = container.getBoundingClientRect()
  return { x: (ev.clientX - rect.left) / scale, y: (ev.clientY - rect.top) / scale }
}

export const bandBetween = (start: FramePoint, current: FramePoint): RubberBand => ({
  x: Math.min(start.x, current.x),
  y: Math.min(start.y, current.y),
  w: Math.abs(current.x - start.x),
  h: Math.abs(current.y - start.y),
})

export const isDeliberateBand = (band: RubberBand): boolean =>
  band.w > RB_THRESHOLD || band.h > RB_THRESHOLD

const widgetArea = (config: DashboardConfig, page: PageConfig) => {
  const profile = resolveScreenProfile(config.targetProfile)
  const height = page.showTopBar !== false ? profile.height - config.topBar.height : profile.height
  return { width: profile.width, height }
}

export const widgetsInBand = (
  config: DashboardConfig,
  pageId: string,
  band: RubberBand
): string[] => {
  const page = config.pages.find((p) => p.id === pageId)
  if (!page) return []
  const area = widgetArea(config, page)
  return page.widgets
    .filter((w) => rectsIntersect(band, resolveGridRect(w.layout, area)))
    .map((w) => w.id)
}
