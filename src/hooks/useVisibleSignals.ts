import { useMemo } from 'react'
import type { SignalDef } from '@canshift/core'
import type { SignalUsage } from './useSignalUsage'
import { groupByFrame, type SignalFrame } from '../lib/signal-frames'
import { displayLabelForSignal } from '../utils/signal-labels'

export interface SignalView {
  filter: string
  hideUnused: boolean
}

const matchesQuery = (signal: SignalDef, query: string): boolean =>
  [signal.name, displayLabelForSignal(signal.name), signal.canFrameId, signal.unit].some((field) =>
    field.toLowerCase().includes(query)
  )

export const visibleSignals = (
  signals: readonly SignalDef[],
  usage: SignalUsage,
  view: SignalView
): SignalDef[] => {
  const query = view.filter.trim().toLowerCase()
  return signals.filter((signal) => {
    if (view.hideUnused && !usage.has(signal.name)) return false
    return query.length === 0 || matchesQuery(signal, query)
  })
}

export const useVisibleFrames = (
  signals: readonly SignalDef[],
  usage: SignalUsage,
  filter: string,
  hideUnused: boolean
): SignalFrame[] =>
  useMemo(
    () => groupByFrame(visibleSignals(signals, usage, { filter, hideUnused })),
    [signals, usage, filter, hideUnused]
  )
