import type { CSSProperties } from 'react'
import type { Obd2Mode01PidEntry, Obd2Polling, SignalDef } from '@canshift/core'
import {
  OBD2_DEFAULT_INTERVAL_MS,
  OBD2_MAX_INTERVAL_MS,
  OBD2_MIN_INTERVAL_MS,
  OBD2_MODE01_PIDS,
  obd2PidLookup,
} from '@canshift/core'
import { CompactSelect } from '@/components/ui/form-field'
import { useSignalStore } from '../../stores/signal.store'
import { MONO_FONT } from '../../lib/typography'

const INPUT_MODE_OPTIONS = [
  { value: 'broadcast', label: 'Broadcast (passive listen)' },
  { value: 'obd2', label: 'OBD-II polling (request/response)' },
] as const

type InputModeKey = (typeof INPUT_MODE_OPTIONS)[number]['value']

const formatPid = (pid: number): string => {
  return `0x${pid.toString(16).toUpperCase().padStart(2, '0')}`
}

const inputModeOf = (signal: SignalDef): InputModeKey => {
  return signal.polling ? 'obd2' : 'broadcast'
}

const replaceSignal = (
  signals: SignalDef[],
  setSignals: (s: SignalDef[]) => void,
  index: number,
  next: SignalDef
): void => {
  const updated = signals.map((s, i) => (i === index ? next : s))
  setSignals(updated)
}

const applyCatalogPid = (signal: SignalDef, entry: Obd2Mode01PidEntry): SignalDef => {
  const polling: Obd2Polling = {
    mode: 0x01,
    pid: entry.pid,
    intervalMs: signal.polling?.intervalMs ?? OBD2_DEFAULT_INTERVAL_MS,
  }
  return {
    ...signal,
    canFrameId: '0x7E8',
    startByte: entry.decode.startByte,
    byteLength: entry.decode.byteLength,
    bigEndian: true,
    signed: false,
    scale: entry.decode.scale,
    offset: entry.decode.offset,
    unit: entry.unit,
    min: entry.range.min,
    max: entry.range.max,
    polling,
  }
}

const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1)

export interface SignalCellProps {
  signal: SignalDef
  index: number
  liveValue: number | undefined
}

export const SignalCell = ({ signal, index, liveValue }: SignalCellProps) => {
  const signals = useSignalStore((s) => s.signals)
  const setSignals = useSignalStore((s) => s.setSignals)

  const mode = inputModeOf(signal)
  const polling = signal.polling

  const catalogEntry = polling ? obd2PidLookup(polling.pid) : undefined
  const isRawPid = mode === 'obd2' && !catalogEntry

  const onModeChange = (raw: string) => {
    const nextMode = raw as InputModeKey
    if (nextMode === mode) return
    if (nextMode === 'broadcast') {
      const { polling: _drop, ...rest } = signal
      void _drop
      replaceSignal(signals, setSignals, index, rest)
      return
    }
    const seed = OBD2_MODE01_PIDS.find((e) => e.signal === signal.name) ?? OBD2_MODE01_PIDS[0]
    if (!seed) return
    replaceSignal(signals, setSignals, index, applyCatalogPid(signal, seed))
  }

  const onPidChange = (raw: string) => {
    const pid = Number.parseInt(raw, 10)
    if (Number.isNaN(pid)) return
    const entry = obd2PidLookup(pid)
    if (entry) {
      replaceSignal(signals, setSignals, index, applyCatalogPid(signal, entry))
      return
    }
    if (!polling) return
    const nextPolling: Obd2Polling = { ...polling, pid }
    replaceSignal(signals, setSignals, index, { ...signal, polling: nextPolling })
  }

  const onIntervalChange = (raw: string) => {
    const intervalMs = Number.parseInt(raw, 10)
    if (Number.isNaN(intervalMs)) return
    if (!polling) return
    const clamped = Math.min(OBD2_MAX_INTERVAL_MS, Math.max(OBD2_MIN_INTERVAL_MS, intervalMs))
    replaceSignal(signals, setSignals, index, {
      ...signal,
      polling: { ...polling, intervalMs: clamped },
    })
  }

  const pidOptions = [
    ...OBD2_MODE01_PIDS.map((entry) => ({
      value: entry.pid.toString(10),
      label: `${formatPid(entry.pid)} — ${entry.label} (${entry.unit})`,
    })),
    ...(isRawPid && polling
      ? [{ value: polling.pid.toString(10), label: `${formatPid(polling.pid)} — custom` }]
      : []),
  ]

  return (
    <div style={cellStyle}>
      <span style={polling ? pidStyle : broadcastPidStyle}>
        {polling ? formatPid(polling.pid) : 'BROADCAST'}
        {isRawPid ? ' · RAW' : ''}
      </span>
      <span style={nameStyle}>{signal.name}</span>
      <div style={valueRowStyle}>
        <span style={valueStyle}>{liveValue !== undefined ? formatValue(liveValue) : '—'}</span>
        <span style={unitStyle}>{signal.unit}</span>
      </div>

      <label style={hintStyle}>Input mode</label>
      <CompactSelect value={mode} options={[...INPUT_MODE_OPTIONS]} onChange={onModeChange} />

      {mode === 'obd2' && polling && (
        <>
          <label style={hintStyle}>PID</label>
          <CompactSelect
            value={polling.pid.toString(10)}
            options={pidOptions}
            onChange={onPidChange}
          />

          <label style={intervalLabelStyle}>
            <span>Interval (ms)</span>
            <span style={intervalValueStyle}>{polling.intervalMs}</span>
          </label>
          <input
            type="range"
            min={OBD2_MIN_INTERVAL_MS}
            max={OBD2_MAX_INTERVAL_MS}
            step={50}
            value={polling.intervalMs}
            onChange={(e) => {
              onIntervalChange(e.target.value)
            }}
            style={{ width: '100%' }}
          />
        </>
      )}
    </div>
  )
}

const cellStyle: CSSProperties = {
  padding: '14px 20px',
  borderRight: '1px solid hsl(var(--brand-neutral-300))',
  borderBottom: '1px solid hsl(var(--brand-neutral-300))',
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  minWidth: 0,
}

const pidStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-accent))',
}

const broadcastPidStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-neutral-500))',
  letterSpacing: '0.08em',
}

const nameStyle: CSSProperties = {
  fontSize: 13,
  color: 'hsl(var(--brand-text))',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const valueRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 5,
}

const valueStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 20,
  color: 'hsl(var(--brand-text))',
  fontVariantNumeric: 'tabular-nums',
}

const unitStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 11,
  color: 'hsl(var(--brand-neutral-600))',
}

const hintStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 10,
  color: 'hsl(var(--brand-neutral-500))',
}

const intervalLabelStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 10,
  color: 'hsl(var(--brand-neutral-500))',
  display: 'flex',
  justifyContent: 'space-between',
}

const intervalValueStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  color: 'hsl(var(--brand-text))',
}
