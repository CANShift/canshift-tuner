import { useMemo, useState, type ReactNode } from 'react'
import type { SignalDef } from '@canshift/core'
import { cn } from '@/lib/utils'
import { SourceBadge, type SignalSource } from '../components/live-data/SourceBadge'
import { LiveDataGrid } from '../components/live-data/LiveDataGrid'
import { LiveDataSkeleton } from '../components/live-data/LiveDataSkeleton'
import { RouteHeader } from '../components/shell/RouteHeader'
import { RoutePage } from '../components/ui/route-shell'
import { useLiveSignals } from '../hooks/useLiveSignals'
import { useSignalStore } from '../stores/signal.store'
import { useDeviceStore } from '../stores/device.store'
import { Input } from '../components/ui/input'

type LiveDataView = 'empty' | 'listening' | 'values'

const EXPORT_BUTTON = [
  'border border-solid border-brand-neutral-400 bg-transparent px-3.5 py-1.5',
  'text-[11px] font-extrabold tracking-[0.08em]',
  'text-brand-text disabled:cursor-not-allowed disabled:text-brand-neutral-500',
].join(' ')

const EMPTY = 'px-6 py-16 text-center text-[13px] text-brand-neutral-500'

const LISTENING = 'flex-1 overflow-y-auto px-6 py-5'

const escapeCsv = (value: string): string => {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

const buildCsv = (signals: readonly SignalDef[], values: Record<string, number>): string => {
  const rows = [
    ['name', 'value', 'unit', 'min', 'max'],
    ...signals.map((s) => {
      const v = values[s.name]
      return [s.name, v !== undefined ? String(v) : '', s.unit, String(s.min), String(s.max)]
    }),
  ]
  return rows.map((r) => r.map(escapeCsv).join(',')).join('\n')
}

const downloadCsv = (signals: readonly SignalDef[], values: Record<string, number>): void => {
  const blob = new Blob([buildCsv(signals, values)], { type: 'text/csv;charset=utf-8' })
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

const resolveSource = (connected: boolean, simulationMode: boolean): SignalSource => {
  if (simulationMode) return 'sim'
  if (connected) return 'live'
  return 'none'
}

const resolveView = (hasRows: boolean, awaitingFirstFrame: boolean): LiveDataView => {
  if (!hasRows) return 'empty'
  if (awaitingFirstFrame) return 'listening'
  return 'values'
}

const LiveDataRoute = () => {
  const signals = useSignalStore((s) => s.signals)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const values = useLiveSignals()
  const [filter, setFilter] = useState('')

  const source = resolveSource(connected, simulationMode)

  const filteredSignals = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return signals
    return signals.filter(
      (s) => s.name.toLowerCase().includes(q) || s.unit.toLowerCase().includes(q)
    )
  }, [signals, filter])

  const awaitingFirstFrame = (connected || simulationMode) && Object.keys(values).length === 0
  const view = resolveView(filteredSignals.length > 0, awaitingFirstFrame)

  const views: Record<LiveDataView, ReactNode> = {
    empty: (
      <div className={EMPTY}>
        {signals.length === 0
          ? 'No signals configured. Pick an ECU profile in the Editor to see live values here.'
          : 'No signals match the current filter.'}
      </div>
    ),
    listening: (
      <div className={LISTENING}>
        <LiveDataSkeleton signalNames={filteredSignals.map((s) => s.name)} />
      </div>
    ),
    values: <LiveDataGrid signals={filteredSignals} values={values} />,
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
              onClick={() => {
                downloadCsv(signals, values)
              }}
              disabled={signals.length === 0}
            >
              EXPORT CSV
            </button>
          </>
        }
      />
      {views[view]}
    </RoutePage>
  )
}

export default LiveDataRoute
