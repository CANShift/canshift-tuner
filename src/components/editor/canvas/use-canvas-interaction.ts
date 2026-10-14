import { useMemo, type ReactNode } from 'react'
import type { DisplayTier, PageConfig } from '@canshift/core'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { useRebindFlashStore } from '../../../stores/rebind-flash.store'
import { overflowingWidgetIds, overlappingWidgetIds } from '../../../utils/widget-diagnostics'
import type { PageFrameInteraction } from './page-frame'
import type { useCanvasEditing } from './use-canvas-editing'
import type { useCanvasSurface } from './use-canvas-surface'

export interface InteractionInputs {
  page: PageConfig
  tier: DisplayTier
  surfaceRef: PageFrameInteraction['surfaceRef']
  surface: ReturnType<typeof useCanvasSurface>
  editing: ReturnType<typeof useCanvasEditing>
  settingsOpen: boolean
  overlay: ReactNode
}

const useWidgetHealth = (page: PageConfig, tier: DisplayTier) => {
  const overlappingIds = useMemo(() => overlappingWidgetIds(page.widgets), [page.widgets])
  const overflowingIds = useMemo(
    () => overflowingWidgetIds(page.widgets, tier),
    [page.widgets, tier]
  )
  return { overlappingIds, overflowingIds }
}

const useSelection = () => ({
  selectedWidgetId: useDashboardStore((s) => s.selectedWidgetId),
  selectedWidgetIds: useDashboardStore((s) => s.selectedWidgetIds),
  onSelect: useDashboardStore((s) => s.selectWidget),
  onShiftSelect: useDashboardStore((s) => s.toggleWidgetSelection),
})

export const useCanvasInteraction = (inputs: InteractionInputs): PageFrameInteraction => {
  const health = useWidgetHealth(inputs.page, inputs.tier)
  const selection = useSelection()
  const flashWidgetId = useRebindFlashStore((s) => s.flashId)
  return {
    surfaceRef: inputs.surfaceRef,
    surfaceProps: inputs.surface.surfaceProps,
    ...selection,
    ...health,
    flashWidgetId,
    onDragStart: inputs.editing.onDragStart,
    onResizeStart: inputs.editing.onResizeStart,
    onSignalDrop: inputs.surface.onSignalDrop,
    settingsOpen: inputs.settingsOpen,
    overlay: inputs.overlay,
  }
}
