import { useMemo } from 'react'
import type { ValueFit } from '@canshift/core'
import { unfitWidgets } from '../lib/value-fit'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'

export const useUnfitWidgets = (): ReadonlyMap<string, ValueFit> => {
  const config = useDashboardStore((s) => s.config)
  const signals = useSignalStore((s) => s.signals)
  return useMemo(
    () => new Map(unfitWidgets(config, signals).map(({ widget, fit }) => [widget.id, fit])),
    [config, signals]
  )
}
