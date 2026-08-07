import { useState } from 'react'
import type { CSSProperties } from 'react'
import { dtcSystem } from '@canshift/core'
import { useDtcStore } from '../../stores/dtc.store'
import { useDeviceStore } from '../../stores/device.store'
import { MONO_FONT } from '../../lib/typography'
import { DtcClearConfirmDialog } from './DtcClearConfirmDialog'

interface DtcBodyProps {
  ready: boolean
  reading: boolean
  hasRead: boolean
  codes: string[]
}

const DtcBody = ({ ready, reading, hasRead, codes }: DtcBodyProps) => {
  if (!ready) return <div style={emptyStyle}>Connect a dash (or use simulation) to read codes.</div>
  if (reading) return <div style={emptyStyle}>Reading trouble codes…</div>
  if (!hasRead) return <div style={emptyStyle}>Read to fetch stored codes over OBD-II Mode 03.</div>
  if (codes.length === 0) return <div style={emptyStyle}>No stored trouble codes.</div>
  return (
    <ul style={listStyle}>
      {codes.map((code) => (
        <li key={code} style={rowStyle}>
          <span style={codeStyle}>{code}</span>
          <span style={systemStyle}>{dtcSystem(code)}</span>
        </li>
      ))}
    </ul>
  )
}

export const DtcPanel = () => {
  const codes = useDtcStore((s) => s.codes)
  const hasRead = useDtcStore((s) => s.hasRead)
  const status = useDtcStore((s) => s.status)
  const error = useDtcStore((s) => s.error)
  const read = useDtcStore((s) => s.read)
  const clear = useDtcStore((s) => s.clear)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const ready = connected || simulationMode
  const busy = status !== 'idle'
  const canRead = ready && !busy
  const canClear = ready && !busy && codes.length > 0

  return (
    <aside style={panelStyle}>
      <div style={headerStyle}>TROUBLE CODES</div>
      <div style={bodyStyle}>
        <DtcBody ready={ready} reading={status === 'reading'} hasRead={hasRead} codes={codes} />
        {error && <div style={errorStyle}>Failed — {error}</div>}
      </div>
      <div style={footerStyle}>
        <button
          type="button"
          onClick={() => {
            void read()
          }}
          disabled={!canRead}
          style={readButtonStyle(canRead)}
        >
          {status === 'reading' ? 'READING…' : 'READ DTCs'}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirmOpen(true)
          }}
          disabled={!canClear}
          style={clearButtonStyle(canClear)}
        >
          {status === 'clearing' ? 'CLEARING…' : 'CLEAR CODES'}
        </button>
      </div>
      <DtcClearConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        codeCount={codes.length}
        onConfirm={() => {
          setConfirmOpen(false)
          void clear()
        }}
      />
    </aside>
  )
}

const panelStyle: CSSProperties = {
  width: 360,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  borderLeft: '2px solid var(--brand-divider)',
  background: 'hsl(var(--brand-neutral-100))',
}

const headerStyle: CSSProperties = {
  padding: '14px 20px',
  borderBottom: '2px solid var(--brand-divider)',
  fontWeight: 800,
  fontSize: 10,
  letterSpacing: '0.2em',
  color: 'hsl(var(--brand-neutral-600))',
}

const bodyStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
}

const emptyStyle: CSSProperties = {
  padding: '16px 20px',
  fontSize: 12,
  lineHeight: 1.5,
  color: 'hsl(var(--brand-neutral-500))',
}

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 12,
  padding: '10px 20px',
  borderBottom: '1px solid hsl(var(--brand-neutral-300))',
}

const codeStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 14,
  fontWeight: 700,
  color: 'hsl(var(--brand-accent))',
  fontVariantNumeric: 'tabular-nums',
}

const systemStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'hsl(var(--brand-neutral-600))',
}

const errorStyle: CSSProperties = {
  padding: '12px 20px',
  fontSize: 12,
  color: 'hsl(var(--brand-accent))',
}

const footerStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  padding: '14px 20px',
  borderTop: '1px solid hsl(var(--brand-neutral-300))',
}

const readButtonStyle = (enabled: boolean): CSSProperties => ({
  padding: '6px 14px',
  background: enabled ? 'hsl(var(--brand-accent))' : 'none',
  border: '1px solid hsl(var(--brand-accent))',
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: '0.09em',
  color: enabled ? '#fff' : 'hsl(var(--brand-neutral-500))',
  cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.5,
})

const clearButtonStyle = (enabled: boolean): CSSProperties => ({
  padding: '6px 14px',
  background: 'none',
  border: '1px solid hsl(var(--brand-accent))',
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: '0.09em',
  color: 'hsl(var(--brand-accent))',
  cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.5,
})
