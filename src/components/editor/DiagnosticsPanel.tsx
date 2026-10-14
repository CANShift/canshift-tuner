import { memo, useMemo } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useLiveSignals } from '../../hooks/useLiveSignals'
import { useSignalStore } from '../../stores/signal.store'
import { useDeviceStore } from '../../stores/device.store'
import type { SignalDef } from '@canshift/core'

interface DiagnosticsPanelProps {
  scale: number
}

const SIGNAL_ROW_DANGER_PCT = 0.95
const SIGNAL_ROW_WARN_PCT = 0.8

type SignalLevel = 'danger' | 'warn' | 'ok'
type LinkState = 'live' | 'sim' | 'none'

const PANEL = 'absolute inset-0 z-[100] flex flex-col overflow-hidden bg-[#0D0D0D]'

const HEADER = 'flex shrink-0 items-baseline border-b border-solid border-[#2A2A2A]'

const TITLE = 'font-semibold uppercase tracking-[0.08em] text-ui-ink'

const HINT = 'ml-auto text-[#444444]'

const linkLabel = cva('font-semibold tracking-[0.06em]', {
  variants: {
    state: { live: 'text-[#33CC55]', sim: 'text-[#FF8800]', none: 'text-[#555555]' },
  },
  defaultVariants: { state: 'none' },
})

const LINK_TEXT: Record<LinkState, string> = { live: 'LIVE', sim: 'SIM', none: 'NO DATA' }

const EMPTY = 'text-center text-[#888888]'

const ROW = 'flex items-center border-b border-solid border-[#181818]'

const ROW_LABEL = 'flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[#AAAAAA]'

const BAR_TRACK = 'shrink-0 overflow-hidden bg-[#1E1E1E]'

const barFill = cva('h-full [transition:width_0.25s_linear]', {
  variants: {
    level: { danger: 'bg-[#FF444488]', warn: 'bg-[#FF880088]', ok: 'bg-[#33CC5555]' },
  },
  defaultVariants: { level: 'ok' },
})

const rowValue = cva('shrink-0 text-right tabular-nums', {
  variants: {
    level: { danger: 'text-[#FF4444]', warn: 'text-[#FF8800]', ok: 'text-[#CCCCCC]' },
  },
  defaultVariants: { level: 'ok' },
})

const ROW_UNIT = 'shrink-0 text-[#555555]'

const levelOf = (pct: number | null): SignalLevel => {
  if (pct === null) return 'ok'
  if (pct >= SIGNAL_ROW_DANGER_PCT) return 'danger'
  if (pct >= SIGNAL_ROW_WARN_PCT) return 'warn'
  return 'ok'
}

interface DiagMetrics {
  scale: number
  fs: number
  pad: number
  rowPad: number
  barW: number
  barH: number
}

const diagMetrics = (scale: number): DiagMetrics => ({
  scale,
  fs: Math.round(scale * 5.5),
  pad: Math.round(scale * 6),
  rowPad: Math.round(scale * 3),
  barW: Math.round(scale * 32),
  barH: Math.round(scale * 4),
})

const linkStateOf = (connected: boolean, simulationMode: boolean): LinkState => {
  if (simulationMode) return 'sim'
  return connected ? 'live' : 'none'
}

interface SignalReading {
  pct: number | null
  displayValue: string
}

const readingOf = (sig: SignalDef, raw: number | undefined): SignalReading => {
  if (raw === undefined) return { pct: null, displayValue: '—' }
  const range = sig.max - sig.min || 1
  return { pct: Math.max(0, Math.min(1, (raw - sig.min) / range)), displayValue: raw.toFixed(1) }
}

interface SignalRowProps extends SignalReading {
  sig: SignalDef
  m: DiagMetrics
}

const LevelBar = ({ pct, m }: { pct: number | null; m: DiagMetrics }) => (
  // eslint-disable-next-line no-inline-style/no-inline-style
  <div className={BAR_TRACK} style={{ width: m.barW, height: m.barH }}>
    {pct !== null && (
      <div
        className={cn(barFill({ level: levelOf(pct) }))}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ width: `${String(Math.round(pct * 100))}%` }}
      />
    )}
  </div>
)

const SignalRowImpl = ({ sig, pct, displayValue, m }: SignalRowProps) => (
  <div
    className={ROW}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ padding: `${String(m.rowPad)}px ${String(m.pad)}px`, gap: Math.round(m.scale * 3) }}
  >
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span className={ROW_LABEL} style={{ fontSize: m.fs }}>
      {sig.name.replace(/_/g, ' ')}
    </span>
    <LevelBar pct={pct} m={m} />
    <span
      className={cn(rowValue({ level: levelOf(pct) }))}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ fontSize: m.fs, minWidth: Math.round(m.scale * 18) }}
    >
      {displayValue}
    </span>
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span className={ROW_UNIT} style={{ fontSize: m.fs - 1, minWidth: Math.round(m.scale * 10) }}>
      {sig.unit}
    </span>
  </div>
)

const SignalRow = memo(SignalRowImpl)

const DiagHeader = ({ m, linkState }: { m: DiagMetrics; linkState: LinkState }) => (
  <div
    className={HEADER}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{
      padding: `${String(m.pad)}px ${String(m.pad)}px ${String(Math.round(m.scale * 3))}px`,
      gap: Math.round(m.scale * 4),
    }}
  >
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span className={TITLE} style={{ fontSize: m.fs + 2 }}>
      Diagnostics
    </span>
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span className={cn(linkLabel({ state: linkState }))} style={{ fontSize: m.fs - 1 }}>
      {LINK_TEXT[linkState]}
    </span>
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <span className={HINT} style={{ fontSize: m.fs - 1 }}>
      swipe ↓ to close
    </span>
  </div>
)

const SignalRows = ({ m }: { m: DiagMetrics }) => {
  const signals = useSignalStore((s) => s.signals)
  const values = useLiveSignals()
  if (signals.length === 0) {
    return (
      // eslint-disable-next-line no-inline-style/no-inline-style
      <div className={EMPTY} style={{ padding: m.pad, paddingTop: m.pad * 3, fontSize: m.fs }}>
        No signals configured.
      </div>
    )
  }
  return signals.map((sig) => (
    <SignalRow key={sig.name} sig={sig} {...readingOf(sig, values[sig.name])} m={m} />
  ))
}

const DiagnosticsPanel = ({ scale }: DiagnosticsPanelProps) => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const m = useMemo(() => diagMetrics(scale), [scale])
  return (
    <div className={PANEL}>
      <DiagHeader m={m} linkState={linkStateOf(connected, simulationMode)} />
      <div className="flex-1 overflow-y-auto">
        <SignalRows m={m} />
      </div>
    </div>
  )
}

export default DiagnosticsPanel
