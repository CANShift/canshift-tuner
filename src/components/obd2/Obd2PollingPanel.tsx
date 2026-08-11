import type { CSSProperties } from 'react'
import { OBD2_MIN_INTERVAL_MS } from '@canshift/core'
import { useLiveSignals } from '../../hooks/useLiveSignals'
import { useSignalStore } from '../../stores/signal.store'
import { SignalCell } from './signal-cell'

const Obd2PollingPanel = () => {
  const signals = useSignalStore((s) => s.signals)
  const values = useLiveSignals()

  if (signals.length === 0) {
    return (
      <div style={emptyStyle}>
        No signals loaded. Apply an ECU profile first — the Mode 01 grid fills from the active
        signal map.
      </div>
    )
  }

  return (
    <div style={scrollStyle}>
      <div style={sectionTitleStyle}>MODE 01 — SIGNAL SOURCES</div>
      <p style={sectionHintStyle}>
        Mode 01 polling sends a query frame per signal (request/response); Broadcast listens
        passively to CAN traffic. Stick to ≥{OBD2_MIN_INTERVAL_MS} ms polling intervals; busy buses
        choke below that.
      </p>
      <div style={gridStyle}>
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

const scrollStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflowY: 'auto',
}

const sectionTitleStyle: CSSProperties = {
  padding: '16px 20px 4px',
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.2em',
  color: 'hsl(var(--brand-neutral-600))',
}

const sectionHintStyle: CSSProperties = {
  padding: '0 20px 10px',
  fontSize: 11,
  lineHeight: 1.4,
  color: 'hsl(var(--brand-neutral-500))',
  maxWidth: 640,
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  borderTop: '2px solid var(--brand-divider)',
}

const emptyStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '64px 24px',
  textAlign: 'center',
  fontSize: 13,
  color: 'hsl(var(--brand-neutral-500))',
}
