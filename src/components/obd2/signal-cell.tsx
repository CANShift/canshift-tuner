import { cva } from 'class-variance-authority'
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
import { cn } from '@/lib/utils'
import { MetaText } from '../ui/meta-text'

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
    <div className="flex min-w-0 flex-col gap-[5px] border-b border-r border-brand-neutral-300 px-5 py-3.5">
      <span className={cn(pidLabel({ polling: polling !== undefined }))}>
        {polling ? formatPid(polling.pid) : 'BROADCAST'}
        {isRawPid ? ' · RAW' : ''}
      </span>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-brand-text">
        {signal.name}
      </span>
      <div className="flex items-baseline gap-[5px]">
        <span className="font-mono text-[20px] tabular-nums text-brand-text">
          {liveValue !== undefined ? formatValue(liveValue) : '—'}
        </span>
        <MetaText>{signal.unit}</MetaText>
      </div>

      <label className={FIELD_HINT}>Input mode</label>
      <CompactSelect value={mode} options={[...INPUT_MODE_OPTIONS]} onChange={onModeChange} />

      {mode === 'obd2' && polling && (
        <>
          <label className={FIELD_HINT}>PID</label>
          <CompactSelect
            value={polling.pid.toString(10)}
            options={pidOptions}
            onChange={onPidChange}
          />

          <label className={cn(FIELD_HINT, 'flex justify-between')}>
            <span>Interval (ms)</span>
            <span className="font-mono text-brand-text">{polling.intervalMs}</span>
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
            className="w-full"
          />
        </>
      )}
    </div>
  )
}

const FIELD_HINT = 'mt-1 text-[10px] text-brand-neutral-500'

const pidLabel = cva('font-mono text-[11px]', {
  variants: {
    polling: {
      true: 'text-brand-accent',
      false: 'tracking-[0.08em] text-brand-neutral-500',
    },
  },
  defaultVariants: { polling: false },
})
