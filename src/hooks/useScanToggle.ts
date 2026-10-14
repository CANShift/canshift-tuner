import { useSignalStore } from '../stores/signal.store'
import { useBusScan } from './useBusScanPanel'

export interface ScanToggle {
  scanning: boolean
  canScan: boolean
  toggle: () => void
}

export const useScanToggle = (onScanStart: () => void): ScanToggle => {
  const signals = useSignalStore((s) => s.signals)
  const scan = useBusScan(signals)
  const toggle = () => {
    if (scan.scanning) {
      void scan.scanner.stop()
      return
    }
    onScanStart()
    void scan.scanner.start()
  }
  return { scanning: scan.scanning, canScan: scan.canScan, toggle }
}
