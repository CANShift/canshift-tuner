const PANEL_SWIPE_MIN_DY = 28
const PAGE_SWIPE_MAX_DY = 20
const PAGE_SWIPE_MIN_DX = 40

export type SwipeIntent = 'open-diag' | 'close-diag' | 'next-page' | 'previous-page' | 'none'

export interface SwipeTravel {
  dx: number
  dy: number
}

export interface OverlayState {
  diagOpen: boolean
  settingsOpen: boolean
}

const panelIntent = (dy: number, overlays: OverlayState): SwipeIntent => {
  if (dy < 0 && !overlays.diagOpen && !overlays.settingsOpen) return 'open-diag'
  if (dy > 0 && overlays.diagOpen) return 'close-diag'
  return 'none'
}

const pageIntent = ({ dx, dy }: SwipeTravel): SwipeIntent => {
  if (Math.abs(dy) > PAGE_SWIPE_MAX_DY || Math.abs(dx) < PAGE_SWIPE_MIN_DX) return 'none'
  return dx < 0 ? 'next-page' : 'previous-page'
}

export const swipeIntent = (travel: SwipeTravel, overlays: OverlayState): SwipeIntent => {
  if (Math.abs(travel.dy) > PANEL_SWIPE_MIN_DY) return panelIntent(travel.dy, overlays)
  if (overlays.diagOpen || overlays.settingsOpen) return 'none'
  return pageIntent(travel)
}
