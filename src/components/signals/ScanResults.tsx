import { BusScanPanel } from './BusScanPanel'
import { useSignalStore } from '../../stores/signal.store'
import { useBusScan } from '../../hooks/useBusScanPanel'
import { formatFrameIdHex } from '../../utils/frame-id'

export const ScanResults = () => {
  const signals = useSignalStore((s) => s.signals)
  const updateSignal = useSignalStore((s) => s.updateSignal)
  const { scanner, frames, boundTo } = useBusScan(signals)
  if (frames.length === 0) return null
  return (
    <BusScanPanel
      frames={frames}
      totalFrames={scanner.snapshot.totalFrames}
      signals={signals}
      boundTo={boundTo}
      onAssign={(frameId, signalName) => {
        updateSignal(signalName, { canFrameId: formatFrameIdHex(frameId) })
      }}
      onClear={scanner.reset}
    />
  )
}
