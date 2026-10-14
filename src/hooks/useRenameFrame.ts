import { useSignalStore } from '../stores/signal.store'

export const useRenameFrame = (): ((from: string, to: string) => void) => {
  const signals = useSignalStore((s) => s.signals)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  return (from, to) => {
    for (const signal of signals) {
      if (signal.canFrameId === from) updateSignal(signal.name, { canFrameId: to })
    }
  }
}
