import { useMemo } from 'react'
import { OBD2_MIN_INTERVAL_MS } from '@canshift/core'
import Obd2PollingPanel from '../components/obd2/Obd2PollingPanel'
import { DtcPanel } from '../components/obd2/DtcPanel'
import { useSignalStore } from '../stores/signal.store'
import { RouteHeader } from '../components/shell/RouteHeader'
import { RouteBody, RoutePage } from '../components/ui/route-shell'

const Obd2Route = () => {
  const signals = useSignalStore((s) => s.signals)
  const pollingCount = useMemo(() => signals.filter((s) => s.polling).length, [signals])

  return (
    <RoutePage>
      <RouteHeader
        title="OBD-II"
        subtitle={`Mode 01 request/response · ${pollingCount} / ${signals.length} polled · ≥${OBD2_MIN_INTERVAL_MS} ms`}
        action={
          <button
            type="button"
            disabled
            title="Requires Mode 03 support on the device link (#1883)"
            className="cursor-not-allowed border-none bg-brand-neutral-300 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.09em] text-brand-neutral-500"
          >
            READ DTCs
          </button>
        }
      />
      <RouteBody>
        <Obd2PollingPanel />
        <DtcPanel />
      </RouteBody>
    </RoutePage>
  )
}

export default Obd2Route
