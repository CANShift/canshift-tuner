import { useMemo } from 'react'
import { useDashboardStore } from '../stores/dashboard.store'

export type SignalUsage = ReadonlyMap<string, number[]>

export const useSignalUsage = (): SignalUsage => {
  const pages = useDashboardStore((s) => s.config?.pages)

  return useMemo(() => {
    const usage = new Map<string, number[]>()
    ;(pages ?? []).forEach((page, index) => {
      for (const widget of page.widgets) {
        if (widget.signal.length === 0) continue
        const seen = usage.get(widget.signal) ?? []
        if (!seen.includes(index + 1)) usage.set(widget.signal, [...seen, index + 1])
      }
    })
    return usage
  }, [pages])
}
