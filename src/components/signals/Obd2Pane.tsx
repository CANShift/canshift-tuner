import { lazy, Suspense, useState } from 'react'
import { OBD2_DEFAULT_INTERVAL_MS, OBD2_MODE01_PIDS } from '@canshift/core'
import { Obd2Table } from './Obd2Table'
import { RouteLoading } from '../shell/RouteLoading'
import { useSignalStore } from '../../stores/signal.store'
import { useLiveSignals } from '../../hooks/useLiveSignals'
import { useSignalUsage } from '../../hooks/useSignalUsage'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'

const DtcPanel = lazy(() => import('../obd2/DtcPanel').then((m) => ({ default: m.DtcPanel })))

const POLL_INTERVALS = [100, 200, 500, 1000]

const usePolling = (intervalMs: number) => {
  const updateSignal = useSignalStore((s) => s.updateSignal)
  return (name: string, polled: boolean) => {
    const entry = OBD2_MODE01_PIDS.find((pid) => pid.signal === name)
    if (!entry) return
    const polling = polled ? { mode: 1 as const, pid: entry.pid, intervalMs } : undefined
    updateSignal(name, { polling })
  }
}

export const Obd2Pane = () => {
  const signals = useSignalStore((s) => s.signals)
  const [intervalMs, setIntervalMs] = useState(OBD2_DEFAULT_INTERVAL_MS)
  const values = useLiveSignals()
  const usage = useSignalUsage()
  const units = useDisplayUnits()
  const togglePolled = usePolling(intervalMs)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Obd2Table
        signals={signals}
        values={values}
        usage={usage}
        units={units}
        intervalMs={intervalMs}
        intervals={POLL_INTERVALS}
        onInterval={setIntervalMs}
        onTogglePolled={togglePolled}
      />
      <div className="shrink-0 border-t-2 border-ui-rule">
        <Suspense fallback={<RouteLoading />}>
          <DtcPanel />
        </Suspense>
      </div>
    </div>
  )
}
