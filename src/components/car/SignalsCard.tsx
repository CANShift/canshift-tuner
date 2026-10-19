import { useMemo } from 'react'
import { STRINGS } from '../../strings'
import { liveCount, signalRows, type SignalRow } from '../../lib/car/signal-rows'
import { signalName } from '../../lib/sync/describe'
import { useLiveSignals } from '../../hooks/useLiveSignals'
import { useSignalStore } from '../../stores/signal.store'
import { cn } from '@/lib/utils'
import { SIGNAL_ROW_SUBGRID, SignalRowItem } from './SignalRowItem'

const C = STRINGS.car

const TABLE_COLUMNS =
  'lg:grid lg:grid-cols-[minmax(9rem,max-content)_minmax(8rem,max-content)_minmax(6rem,max-content)_max-content] lg:gap-x-8'

const TableHead = () => (
  <div
    className={cn(
      SIGNAL_ROW_SUBGRID,
      'hidden h-10 items-center border-b border-app-border px-4 text-[13px] text-app-muted'
    )}
  >
    <span>{C.signalColumn}</span>
    <span>{C.valueColumn}</span>
    <span>{C.statusColumn}</span>
  </div>
)

const NoDataNotes = ({ rows }: { rows: readonly SignalRow[] }) => {
  const silent = rows.filter((row) => !row.live)
  if (silent.length === 0 || silent.length === rows.length) return null
  return (
    <ul className="hidden flex-col gap-1 text-sm text-app-warning lg:flex">
      {silent.map((row) => (
        <li key={row.signal.name}>{C.noDataFor(signalName(row.signal.name))}</li>
      ))}
    </ul>
  )
}

const AllSilent = ({ rows }: { rows: readonly SignalRow[] }) =>
  rows.length > 0 && liveCount(rows) === 0 ? (
    <p className="text-sm text-app-warning">{C.noData}</p>
  ) : null

const SIGNALS_VIEWPORT = 'lg:max-h-[calc(100dvh-20rem)] lg:min-h-64 lg:overflow-y-auto'

const CardHeader = ({ rows }: { rows: readonly SignalRow[] }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-app-border px-4 py-3 lg:col-span-full">
    <h2 className="text-lg font-bold lg:text-xl">{C.signals}</h2>
    <span className="text-sm text-app-muted">
      {C.comingIn(liveCount(rows), rows.length)} ·{' '}
      <span className="lg:hidden">{C.tapToAdjust}</span>
      <span className="max-lg:hidden">{C.problemsFirst}</span>
    </span>
  </div>
)

interface SignalsTableProps {
  rows: readonly SignalRow[]
  onAdjust: (signal: string) => void
}

const SignalsTable = ({ rows, onAdjust }: SignalsTableProps) => (
  <section
    className={cn(
      TABLE_COLUMNS,
      'overflow-hidden rounded-card border border-app-border bg-app-surface'
    )}
  >
    <CardHeader rows={rows} />
    <TableHead />
    <ul className={cn(SIGNAL_ROW_SUBGRID, SIGNALS_VIEWPORT)}>
      {rows.map((row) => (
        <SignalRowItem key={row.signal.name} row={row} onAdjust={onAdjust} />
      ))}
    </ul>
  </section>
)

export const SignalsCard = ({ onAdjust }: { onAdjust: (signal: string) => void }) => {
  const signals = useSignalStore((s) => s.signals)
  const values = useLiveSignals()
  const rows = useMemo(() => signalRows(signals, values), [signals, values])
  return (
    <>
      <AllSilent rows={rows} />
      <SignalsTable rows={rows} onAdjust={onAdjust} />
      <NoDataNotes rows={rows} />
    </>
  )
}
