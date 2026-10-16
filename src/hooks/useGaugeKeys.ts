import { useEffect } from 'react'
import type { PageConfig } from '@canshift/core'
import { neighbourOf, inReadingOrder, type Step } from '../lib/gauges/reading-order'
import { useDashboardStore } from '../stores/dashboard.store'
import { isEditableTarget } from '../utils/is-editable-target'

const STEPS: Record<string, Step> = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }

const nextSelection = (page: PageConfig, selectedId: string | null, step: Step): string | null => {
  if (selectedId === null) return inReadingOrder(page.widgets)[0]?.id ?? null
  return neighbourOf(page, selectedId, step)?.id ?? selectedId
}

const onKey = (page: PageConfig, event: KeyboardEvent): void => {
  if (isEditableTarget(event.target)) return
  const store = useDashboardStore.getState()
  if (event.key === 'Escape') {
    store.selectWidget(null)
    return
  }
  const step = STEPS[event.key]
  if (step === undefined) return
  event.preventDefault()
  store.selectWidget(nextSelection(page, store.selectedWidgetId, step))
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
