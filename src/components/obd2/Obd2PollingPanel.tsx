import { OBD2_MIN_INTERVAL_MS } from '@canshift/core'
import { useLiveSignals } from '../../hooks/useLiveSignals'
import { useSignalStore } from '../../stores/signal.store'
import { SignalCell } from './signal-cell'
import { Eyebrow } from '../ui/meta-text'

const Obd2PollingPanel = () => {
  const signals = useSignalStore((s) => s.signals)
  const values = useLiveSignals()

  if (signals.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-center text-[13px] text-brand-neutral-500">
        No signals loaded. Apply an ECU profile first — the Mode 01 grid fills from the active
        signal map.
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1 overflow-y-auto">
      <Eyebrow className="block px-5 pb-1 pt-4">MODE 01 — SIGNAL SOURCES</Eyebrow>
      <p className="max-w-[640px] px-5 pb-2.5 text-[11px] leading-[1.4] text-brand-neutral-500">
        Mode 01 polling sends a query frame per signal (request/response); Broadcast listens
        passively to CAN traffic. Stick to ≥{OBD2_MIN_INTERVAL_MS} ms polling intervals; busy buses
        choke below that.
      </p>
      <div className="grid grid-cols-4 border-t-2 border-brand-divider">
        {signals.map((signal, index) => (
          <SignalCell
            key={signal.name}
            signal={signal}
            index={index}
            liveValue={values[signal.name]}
          />
        ))}
      </div>
    </div>
  )
}

export default Obd2PollingPanel
