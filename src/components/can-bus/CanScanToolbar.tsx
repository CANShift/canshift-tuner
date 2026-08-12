import { cva } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import type { CanScannerStatus } from '../../hooks/useCanScanner'
import type { LearnWindow } from '../../stores/can-scan/accumulator'
import { cn } from '@/lib/utils'
import { Eyebrow } from '../ui/meta-text'
import { SortBar, type SortKey } from './SortBar'
import { transportErrorText } from '../../transport/humanize-transport-error'

export interface CanScanToolbarProps {
  status: CanScannerStatus
  canControl: boolean
  totalFrames: number
  totalRate: number
  startedAt: number | null
  error: string | null
  sortKey: SortKey
  learn: LearnWindow | null
  onSortChange: (key: SortKey) => void
  onStart: () => void
  onStop: () => void
  onReset: () => void
  onLearnStart: () => void
  onLearnStop: () => void
}

export const CanScanToolbar = ({
  status,
  canControl,
  totalFrames,
  totalRate,
  startedAt,
  error,
  sortKey,
  learn,
  onSortChange,
  onStart,
  onStop,
  onReset,
  onLearnStart,
  onLearnStop,
}: CanScanToolbarProps) => {
  const elapsedSec = useElapsedSeconds(startedAt, status === 'running')
  const running = status === 'running' || status === 'starting'

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b-2 border-brand-divider px-5">
        {running ? (
          <button
            type="button"
            disabled={status !== 'running'}
            onClick={onStop}
            className={cn(
              'editor-ghost-accent',
              scanButton({ tone: 'stop', disabled: status !== 'running' })
            )}
          >
            STOP SCAN
          </button>
        ) : (
          <button
            type="button"
            disabled={!canControl || status === 'stopping'}
            onClick={onStart}
            className={cn(
              'shell-burn-button',
              scanButton({ tone: 'start', disabled: !canControl || status === 'stopping' })
            )}
          >
            START SCAN
          </button>
        )}
        <button
          type="button"
          disabled={running || totalFrames === 0}
          onClick={onReset}
          className={cn(
            'shell-link-button',
            scanButton({ tone: 'reset', disabled: running || totalFrames === 0 })
          )}
        >
          RESET
        </button>
        {learn?.active === true ? (
          <button
            type="button"
            onClick={onLearnStop}
            className={cn('editor-ghost-accent', learnButton({ disabled: false, active: true }))}
            title="Stop the learn window — the CHANGES column keeps the result"
          >
            ◉ LEARNING — STOP
          </button>
        ) : (
          <button
            type="button"
            disabled={status !== 'running'}
            onClick={onLearnStart}
            className={cn(
              'editor-ghost-accent',
              learnButton({ disabled: status !== 'running', active: false })
            )}
            title="Start a learn window, then do the thing in the car (rev, clutch, wheel) — the table ranks the IDs that changed the most"
          >
            LEARN
          </button>
        )}
        <Eyebrow className="ml-2 tracking-[0.18em]">SORT BY</Eyebrow>
        <SortBar sortKey={sortKey} onChange={onSortChange} />
        {!canControl && (
          <span className="text-[11px] text-brand-neutral-500">Connect a device to scan.</span>
        )}
        <div className="ml-auto flex gap-[30px] tabular-nums">
          <Metric label="FRAMES" value={formatCount(totalFrames)} />
          <Metric label="RATE" value={`${String(Math.round(totalRate))} Hz`} />
          <Metric label="ELAPSED" value={formatElapsed(elapsedSec)} />
          <Metric label="STATUS" value={prettyStatus(status)} accent={status === 'running'} />
        </div>
      </header>
      {error && (
        <div className="border-b border-brand-neutral-300 px-5 py-2 text-[12px] text-brand-accent">
          Scan error: {transportErrorText(error)}
        </div>
      )}
    </>
  )
}

const useElapsedSeconds = (startedAt: number | null, running: boolean): number => {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setTick((t) => t + 1)
    }, 500)
    return () => {
      window.clearInterval(id)
    }
  }, [running])
  void tick
  if (startedAt === null) return 0
  return Math.floor((performance.now() - startedAt) / 1000)
}

const prettyStatus = (status: CanScannerStatus): string => {
  switch (status) {
    case 'idle':
      return 'Idle'
    case 'starting':
      return 'Starting…'
    case 'running':
      return 'Scanning'
    case 'stopping':
      return 'Stopping…'
    case 'error':
      return 'Error'
  }
}

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

const formatElapsed = (sec: number): string => {
  if (sec < 60) return `${String(sec)}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m)}m ${String(s).padStart(2, '0')}s`
}

const Metric = ({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) => (
  <div className="flex flex-col items-end">
    <span className="text-[9px] font-extrabold tracking-[0.18em] text-brand-neutral-600">
      {label}
    </span>
    <span className={cn(metricValue({ accent }))}>{value}</span>
  </div>
)

const scanButton = cva('border-none text-[11px] font-extrabold', {
  variants: {
    tone: {
      start: 'px-[18px] py-1.5 tracking-[0.09em]',
      stop: 'border border-solid border-brand-accent bg-transparent px-[18px] py-1.5 tracking-[0.09em] text-brand-accent',
      reset:
        'border border-solid border-brand-neutral-400 bg-transparent px-3.5 py-1.5 tracking-[0.08em]',
    },
    disabled: {
      true: 'cursor-not-allowed',
      false: 'cursor-pointer',
    },
  },
  compoundVariants: [
    { tone: 'start', disabled: true, class: 'bg-brand-neutral-300 text-brand-neutral-500' },
    { tone: 'start', disabled: false, class: 'bg-brand-accent text-brand-ground' },
    { tone: 'stop', disabled: true, class: 'opacity-60' },
    { tone: 'stop', disabled: false, class: 'opacity-100' },
    { tone: 'reset', disabled: true, class: 'text-brand-neutral-500' },
    { tone: 'reset', disabled: false, class: 'text-brand-text' },
  ],
  defaultVariants: { disabled: false },
})

const learnButton = cva(
  'border border-solid px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.09em]',
  {
    variants: {
      disabled: {
        true: 'cursor-default border-brand-neutral-300 text-brand-neutral-400',
        false: 'cursor-pointer border-brand-accent text-brand-accent',
      },
      active: {
        true: 'bg-[color-mix(in_srgb,hsl(var(--brand-accent))_14%,transparent)]',
        false: 'bg-transparent',
      },
    },
    defaultVariants: { disabled: false, active: false },
  }
)

const metricValue = cva('font-mono text-[15px]', {
  variants: {
    accent: {
      true: 'text-brand-accent',
      false: 'text-brand-text',
    },
  },
  defaultVariants: { accent: false },
})
