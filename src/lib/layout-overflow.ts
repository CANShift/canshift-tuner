import type { DashboardConfig, GridPlacement, ScreenProfile, Widget } from '@canshift/core'
import { LAYOUT_GRID, isSpanOverflowing, resolveScreenProfile } from '@canshift/core'
import { displayLabelForSignal } from '../utils/signal-labels'

export interface LayoutOverflow {
  pageId: string
  widgetId: string
  kicker: string
  title: string
  body: string
}

type Edge = 'bottom' | 'right' | 'top' | 'left'

interface EdgeViolation {
  edge: Edge
  at: number
  over: number
}

interface WidgetBounds {
  left: number
  right: number
  top: number
  bottom: number
}

const EDGE_LABELS: Record<Edge, string> = {
  bottom: 'Bottom',
  right: 'Right',
  top: 'Top',
  left: 'Left',
}

const contentSize = (size: number): number => Math.max(size - 2 * LAYOUT_GRID.FRAME_PADDING, 0)

const trackEdge = (track: number, size: number, tracks: number): number =>
  LAYOUT_GRID.FRAME_PADDING +
  Math.round((track * (contentSize(size) + LAYOUT_GRID.GUTTER)) / tracks)

const widgetBounds = (
  placement: GridPlacement,
  screen: ScreenProfile,
  topOffset: number
): WidgetBounds => {
  const areaHeight = screen.height - topOffset
  return {
    left: trackEdge(placement.col, screen.width, LAYOUT_GRID.COLUMNS),
    right:
      trackEdge(placement.col + placement.colSpan, screen.width, LAYOUT_GRID.COLUMNS) -
      LAYOUT_GRID.GUTTER,
    top: topOffset + trackEdge(placement.row, areaHeight, LAYOUT_GRID.ROWS),
    bottom:
      topOffset +
      trackEdge(placement.row + placement.rowSpan, areaHeight, LAYOUT_GRID.ROWS) -
      LAYOUT_GRID.GUTTER,
  }
}

const worstViolation = (bounds: WidgetBounds, screen: ScreenProfile): EdgeViolation | undefined => {
  const candidates: EdgeViolation[] = [
    { edge: 'bottom', at: bounds.bottom, over: bounds.bottom - screen.height },
    { edge: 'right', at: bounds.right, over: bounds.right - screen.width },
    { edge: 'top', at: bounds.top, over: -bounds.top },
    { edge: 'left', at: bounds.left, over: -bounds.left },
  ]
  return candidates.filter((c) => c.over > 0).sort((a, b) => b.over - a.over)[0]
}

const widgetLabel = (widget: Widget): string =>
  widget.signal ? displayLabelForSignal(widget.signal) : widget.type.toUpperCase()

interface OffenderCopy {
  violation: EdgeViolation
  screen: ScreenProfile
  pageId: string
  pageIndex: number
  widget: Widget
}

const describe = ({
  violation,
  screen,
  pageId,
  pageIndex,
  widget,
}: OffenderCopy): LayoutOverflow => ({
  pageId,
  widgetId: widget.id,
  kicker: `PAGE ${String(pageIndex + 1)} · WIDGET ${widgetLabel(widget)}`,
  title: `This layout will not fit ${String(screen.width)} × ${String(screen.height)}`,
  body: `${EDGE_LABELS[violation.edge]} edge at ${String(violation.at)} px, ${String(violation.over)} px over. Burn stays disabled until it fits — the dash never scales a layout to make it work.`,
})

export const describeLayoutOverflow = (config: DashboardConfig): LayoutOverflow | null => {
  const screen = resolveScreenProfile(config.targetProfile)
  for (const [pageIndex, page] of config.pages.entries()) {
    const topOffset = page.showTopBar === false ? 0 : config.topBar.height
    for (const widget of page.widgets) {
      if (!isSpanOverflowing(widget.layout)) continue
      const violation = worstViolation(widgetBounds(widget.layout, screen, topOffset), screen)
      if (violation === undefined) continue
      return describe({ violation, screen, pageId: page.id, pageIndex, widget })
    }
  }
  return null
}
