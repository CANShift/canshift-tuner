import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { LiveDataEmpty } from '../components/live-data/LiveDataEmpty'
import { SourceBadge, type SignalSource } from '../components/live-data/SourceBadge'
import { RouteHeader } from '../components/shell/RouteHeader'
import { RoutePage } from '../components/ui/route-shell'
import { BusSilentNotice } from '../components/states/BusSilentNotice'
import { useLiveSignals } from '../hooks/useLiveSignals'
import { useSignalStore } from '../stores/signal.store'
import { useDeviceStore } from '../stores/device.store'
import { Input } from '../components/ui/input'

const DANGER_FRACTION = 0.9

const EXPORT_BUTTON = [
  'border border-solid border-brand-neutral-400 bg-transparent px-3.5 py-1.5',
  'text-[11px] font-extrabold tracking-[0.08em]',
  'text-brand-text disabled:cursor-not-allowed disabled:text-brand-neutral-500',
].join(' ')

const GRID = 'grid flex-1 grid-cols-4 overflow-y-auto [grid-auto-rows:minmax(150px,1fr)]'

const CELL = [
  'flex min-w-0 flex-col justify-center gap-[9px] px-5 py-[18px]',
  'border-r border-b border-solid border-brand-neutral-300',
].join(' ')

const CELL_LABEL = [
  'overflow-hidden text-ellipsis whitespace-nowrap',
  'text-[10px] font-extrabold tracking-[0.18em] text-brand-neutral-600',
].join(' ')

const tinted = cva('', {
  variants: {
    danger: { true: 'text-brand-accent', false: 'text-brand-text' },
  },
  defaultVariants: { danger: false },
})

const barFill = cva('h-full', {
  variants: {
    danger: { true: 'bg-brand-accent', false: 'bg-brand-text' },
  },
  defaultVariants: { danger: false },
})

const CELL_VALUE = 'font-mono text-[44px] leading-[1.1] tabular-nums'

const LiveDataRoute = () => {
  const signals = useSignalStore((s) => s.signals)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const values = useLiveSignals()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')

  const isLive = connected && !simulationMode
  const source: SignalSource = isLive ? 'live' : simulationMode ? 'sim' : 'none'

  const filteredSignals = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return signals
    return signals.filter(
      (s) => s.name.toLowerCase().includes(q) || s.unit.toLowerCase().includes(q)
    )
  }, [signals, filter])

  const handleExport = () => {
    const rows = [
      ['name', 'value', 'unit', 'min', 'max'],
      ...signals.map((s) => {
        const v = values[s.name]
        return [s.name, v !== undefined ? String(v) : '', s.unit, String(s.min), String(s.max)]
      }),
    ]
    const csv = rows.map((r) => r.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    a.href = url
    a.download = `canshift-live-${stamp}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <RoutePage>
      <RouteHeader
        title="Live data"
        subtitle={
          <>
            {signals.length} signal{signals.length === 1 ? '' : 's'} ·{' '}
            <SourceBadge source={source} />
          </>
        }
        action={
          <>
            <Input
              type="search"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
              }}
              placeholder="Filter by name or unit"
              className="h-8 w-[200px] text-xs"
            />
            <button
              type="button"
              className={cn('editor-ghost-accent', EXPORT_BUTTON)}
              onClick={handleExport}
              disabled={signals.length === 0}
            >
              EXPORT CSV
            </button>
          </>
        }
      />

      <BusSilentNotice />

      {filteredSignals.length === 0 ? (
        <LiveDataEmpty
          hasProfile={signals.length > 0}
          onPickProfile={() => {
            void navigate('/ecu')
          }}
          onCaptureBus={() => {
            void navigate('/can')
          }}
        />
      ) : (
        <div className={GRID}>
          {filteredSignals.map((sig) => {
            const raw = values[sig.name]
            const range = sig.max - sig.min || 1
            const pct = raw !== undefined ? Math.max(0, Math.min(1, (raw - sig.min) / range)) : 0
            const danger = pct >= DANGER_FRACTION
            return (
              <div key={sig.name} className={CELL}>
                <span className={CELL_LABEL}>{sig.name.replace(/_/g, ' ').toUpperCase()}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className={cn(CELL_VALUE, tinted({ danger }))}>
                    {raw !== undefined ? formatValue(raw) : '—'}
                  </span>
                  <span className="font-mono text-[13px] text-brand-neutral-600">{sig.unit}</span>
                </div>
                <div className="h-1 bg-brand-neutral-300">
                  <div
                    className={cn(barFill({ danger }))}
                    // eslint-disable-next-line no-inline-style/no-inline-style
                    style={{ width: `${String(Math.round(pct * 100))}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </RoutePage>
  )
}

const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1)

const escapeCsv = (value: string): string => {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export default LiveDataRoute
