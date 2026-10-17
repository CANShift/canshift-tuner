import { useEffect } from 'react'
import type { PageConfig } from '@canshift/core'
import { neighbourOf, inReadingOrder, type Step } from '../lib/gauges/reading-order'
import { useDashboardStore } from '../stores/dashboard.store'
import type { GridStep } from '../stores/dashboard/widget-moves'
import { isEditableTarget } from '../utils/is-editable-target'

const STEPS: Record<string, Step> = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }

const GRID_STEPS: Record<string, GridStep> = {
  ArrowLeft: { cols: -1, rows: 0 },
  ArrowRight: { cols: 1, rows: 0 },
  ArrowUp: { cols: 0, rows: -1 },
  ArrowDown: { cols: 0, rows: 1 },
}

type ArrowAction = 'select' | 'nudge' | 'resize'

const actionOf = (event: KeyboardEvent): ArrowAction => {
  if (!event.altKey) return 'select'
  return event.shiftKey ? 'resize' : 'nudge'
}

const nextSelection = (page: PageConfig, selectedId: string | null, step: Step): string | null => {
  if (selectedId === null) return inReadingOrder(page.widgets)[0]?.id ?? null
  return neighbourOf(page, selectedId, step)?.id ?? selectedId
}

const ARROW_ACTIONS: Record<ArrowAction, (page: PageConfig, key: string) => void> = {
  select: (page, key) => {
    const store = useDashboardStore.getState()
    store.selectWidget(nextSelection(page, store.selectedWidgetId, STEPS[key] ?? 1))
  },
  nudge: (page, key) => {
    const store = useDashboardStore.getState()
    store.nudgeWidgets(page.id, store.selectedWidgetIds, GRID_STEPS[key] ?? { cols: 0, rows: 0 })
  },
  resize: (page, key) => {
    const store = useDashboardStore.getState()
    store.resizeWidgets(page.id, store.selectedWidgetIds, GRID_STEPS[key] ?? { cols: 0, rows: 0 })
  },
}

const onKey = (page: PageConfig, event: KeyboardEvent): void => {
  if (isEditableTarget(event.target)) return
  if (event.key === 'Escape') {
    useDashboardStore.getState().selectWidget(null)
    return
  }
  if (!(event.key in GRID_STEPS)) return
  event.preventDefault()
  ARROW_ACTIONS[actionOf(event)](page, event.key)
}

export const useGaugeKeys = (page: PageConfig | null, enabled: boolean): void => {
  useEffect(() => {
    if (!enabled || page === null) return
    const listener = (event: KeyboardEvent) => {
      onKey(page, event)
    }
    window.addEventListener('keydown', listener)
    return () => {
      window.removeEventListener('keydown', listener)
    }
  }, [page, enabled])
}
