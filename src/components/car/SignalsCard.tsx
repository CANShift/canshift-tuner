import { useMemo } from 'react'
import { STRINGS } from '../../strings'
import { liveCount, signalRows, type SignalRow } from '../../lib/car/signal-rows'
import { signalName } from '../../lib/sync/describe'
import { useLiveSignals } from '../../hooks/useLiveSignals'
import { useSignalStore } from '../../stores/signal.store'
import { SignalRowItem } from './SignalRowItem'

const C = STRINGS.car

const TableHead = () => (
  <div className="hidden h-10 grid-cols-[2fr_1.4fr_1fr_96px] items-center border-b border-app-border px-4 text-[13px] text-app-muted lg:grid">
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

export const SignalsCard = ({ onAdjust }: { onAdjust: (signal: string) => void }) => {
  const signals = useSignalStore((s) => s.signals)
  const values = useLiveSignals()
  const rows = useMemo(() => signalRows(signals, values), [signals, values])
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold lg:text-xl">{C.signals}</h2>
        <span className="text-sm text-app-muted">
          {C.comingIn(liveCount(rows), rows.length)} ·{' '}
          <span className="lg:hidden">{C.tapToAdjust}</span>
          <span className="max-lg:hidden">{C.problemsFirst}</span>
        </span>
      </div>
      <AllSilent rows={rows} />
      <div className="overflow-hidden rounded-card border border-app-border bg-app-surface">
        <TableHead />
        <ul>
          {rows.map((row) => (
            <SignalRowItem key={row.signal.name} row={row} onAdjust={onAdjust} />
          ))}
        </ul>
      </div>
      <NoDataNotes rows={rows} />
    </>
  )
}
