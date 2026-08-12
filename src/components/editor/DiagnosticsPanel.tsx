import { memo } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useLiveSignals } from '../../hooks/useLiveSignals'
import { useSignalStore } from '../../stores/signal.store'
import { useDeviceStore } from '../../stores/device.store'

interface DiagnosticsPanelProps {
  scale: number
}

const SIGNAL_ROW_DANGER_PCT = 0.95
const SIGNAL_ROW_WARN_PCT = 0.8

type SignalLevel = 'danger' | 'warn' | 'ok'
type LinkState = 'live' | 'sim' | 'none'

const PANEL = 'absolute inset-0 z-[100] flex flex-col overflow-hidden bg-[#0D0D0D]'

const HEADER = 'flex shrink-0 items-baseline border-b border-solid border-[#2A2A2A]'

const TITLE = 'font-semibold uppercase tracking-[0.08em] text-text'

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

interface SignalRowProps {
  name: string
  unit: string
  displayValue: string
  pct: number | null
  fs: number
  rowPad: number
  pad: number
  barW: number
  barH: number
  scale: number
}

const SignalRowImpl = ({
  name,
  unit,
  displayValue,
  pct,
  fs,
  rowPad,
  pad,
  barW,
  barH,
  scale,
}: SignalRowProps) => {
  const level = levelOf(pct)
  return (
    <div
      className={ROW}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ padding: `${String(rowPad)}px ${String(pad)}px`, gap: Math.round(scale * 3) }}
    >
      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <span className={ROW_LABEL} style={{ fontSize: fs }}>
        {name.replace(/_/g, ' ')}
      </span>

      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <div className={BAR_TRACK} style={{ width: barW, height: barH }}>
        {pct !== null && (
          <div
            className={cn(barFill({ level }))}
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ width: `${String(Math.round(pct * 100))}%` }}
          />
        )}
      </div>

      <span
        className={cn(rowValue({ level }))}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ fontSize: fs, minWidth: Math.round(scale * 18) }}
      >
        {displayValue}
      </span>

      <span
        className={ROW_UNIT}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ fontSize: fs - 1, minWidth: Math.round(scale * 10) }}
      >
        {unit}
      </span>
    </div>
  )
}

const SignalRow = memo(SignalRowImpl)

const DiagnosticsPanel = ({ scale }: DiagnosticsPanelProps) => {
  const signals = useSignalStore((s) => s.signals)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const values = useLiveSignals()

  const fs = Math.round(scale * 5.5)
  const pad = Math.round(scale * 6)
  const rowPad = Math.round(scale * 3)
  const barW = Math.round(scale * 32)
  const barH = Math.round(scale * 4)

  const linkState: LinkState =
    connected && !simulationMode ? 'live' : simulationMode ? 'sim' : 'none'

  return (
    <div className={PANEL}>
      <div
        className={HEADER}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{
          padding: `${String(pad)}px ${String(pad)}px ${String(Math.round(scale * 3))}px`,
          gap: Math.round(scale * 4),
        }}
      >
        {/* eslint-disable-next-line no-inline-style/no-inline-style */}
        <span className={TITLE} style={{ fontSize: fs + 2 }}>
          Diagnostics
        </span>
        <span
          className={cn(linkLabel({ state: linkState }))}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ fontSize: fs - 1 }}
        >
          {LINK_TEXT[linkState]}
        </span>
        {/* eslint-disable-next-line no-inline-style/no-inline-style */}
        <span className={HINT} style={{ fontSize: fs - 1 }}>
          swipe ↓ to close
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {signals.length === 0 ? (
          <div
            className={EMPTY}
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ padding: pad, paddingTop: pad * 3, fontSize: fs }}
          >
            No signals configured.
          </div>
        ) : (
          signals.map((sig) => {
            const raw = values[sig.name]
            const range = sig.max - sig.min || 1
            const pct = raw !== undefined ? Math.max(0, Math.min(1, (raw - sig.min) / range)) : null
            const displayValue = raw !== undefined ? raw.toFixed(1) : '—'
            return (
              <SignalRow
                key={sig.name}
                name={sig.name}
                unit={sig.unit}
                displayValue={displayValue}
                pct={pct}
                fs={fs}
                rowPad={rowPad}
                pad={pad}
                barW={barW}
                barH={barH}
                scale={scale}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export default DiagnosticsPanel
