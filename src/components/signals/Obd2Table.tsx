import { OBD2_MODE01_PIDS } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import { cn } from '@/lib/utils'
import type { DisplayUnits } from '../../hooks/useDisplayUnits'
import type { SignalUsage } from '../../hooks/useSignalUsage'
import { formatSignalValue } from '../../lib/format'

const GRID = [
  'grid min-w-[720px] grid-cols-[100px_minmax(140px,1fr)_120px_100px_minmax(120px,260px)] gap-5',
  'min-[1180px]:grid-cols-[120px_minmax(180px,1fr)_140px_120px_minmax(150px,260px)]',
  'min-[1180px]:gap-10',
].join(' ')
const NOT_IN_PROFILE = 'not in the profile'

const CONTEXT =
  'OBD-II is the fallback when the car has no ECU profile: the dash polls standard PIDs instead of listening to raw frames. Slower and fewer signals, but it works on any car built after 2008.'

export interface Obd2TableProps {
  units: DisplayUnits
  signals: readonly SignalDef[]
  values: Record<string, number>
  usage: SignalUsage
  intervalMs: number
  intervals: readonly number[]
  onInterval: (ms: number) => void
  onTogglePolled: (signalName: string, polled: boolean) => void
}

const hex = (pid: number): string => `0x${pid.toString(16).toUpperCase().padStart(2, '0')}`

type Obd2Entry = (typeof OBD2_MODE01_PIDS)[number]

type PollRateProps = Pick<Obd2TableProps, 'intervalMs' | 'intervals' | 'onInterval'>

const PollRate = ({ intervalMs, intervals, onInterval }: PollRateProps) => (
  <div className="flex items-center gap-4 pb-[18px]">
    <span className="font-mono text-[10.5px] tracking-[0.16em] text-ui-muted">POLL RATE</span>
    <select
      value={String(intervalMs)}
      aria-label="Poll rate"
      onChange={(e) => {
        onInterval(Number(e.target.value))
      }}
      className="border border-ui-ink bg-ui-bg py-2 pl-2.5 pr-[26px] font-mono text-[14px] font-bold text-ui-ink"
    >
      {intervals.map((ms) => (
        <option key={ms} value={String(ms)}>
          {ms} ms
        </option>
      ))}
    </select>
  </div>
)

const Obd2Header = () => (
  <div
    className={cn(
      GRID,
      'sticky top-0 z-[2] border-b-2 border-t border-ui-rule border-t-ui-line bg-ui-panel px-7 py-3',
      'font-mono text-[10px] tracking-[0.16em] text-ui-muted'
    )}
  >
    <span>PID</span>
    <span>SIGNAL</span>
    <span className="text-right">VALUE</span>
    <span>UNIT</span>
    <span>POLLED</span>
  </div>
)

interface PolledToggleProps {
  entry: Obd2Entry
  signal: SignalDef | undefined
  onTogglePolled: Obd2TableProps['onTogglePolled']
}

const PolledToggle = ({ entry, signal, onTogglePolled }: PolledToggleProps) => {
  if (signal === undefined)
    return <span className="text-[12px] text-ui-faint">{NOT_IN_PROFILE}</span>
  const polled = signal.polling !== undefined
  return (
    <button
      type="button"
      onClick={() => {
        onTogglePolled(entry.signal, !polled)
      }}
      className={cn(
        'cursor-pointer border-0 bg-transparent p-0 font-mono text-[13px]',
        polled ? 'text-ui-ok' : 'text-ui-faint'
      )}
    >
      {polled ? 'polled' : 'skip'}
    </button>
  )
}

type Obd2RowProps = Pick<Obd2TableProps, 'values' | 'units' | 'onTogglePolled'> & {
  entry: Obd2Entry
  signal: SignalDef | undefined
  pages: readonly number[]
}

const shownValue = ({ entry, values, units }: Obd2RowProps): string => {
  const raw = values[entry.signal]
  return formatSignalValue(raw === undefined ? undefined : units.valueOf(raw, entry.unit))
}

const Obd2Row = (props: Obd2RowProps) => {
  const { entry, signal, pages, units } = props
  return (
    <div
      className={cn(
        GRID,
        'items-center border-b border-ui-line px-7 py-[15px] font-mono text-[14px]',
        'hover:bg-ui-panel',
        signal === undefined ? 'text-ui-faint' : 'text-ui-ink'
      )}
    >
      <span className="text-ui-accent">{hex(entry.pid)}</span>
      <span className="truncate font-bold" title={entry.description}>
        {entry.signal}
      </span>
      <span className="text-right tabular-nums">{shownValue(props)}</span>
      <span className="text-[13px] text-ui-faint">{units.unitOf(entry.unit)}</span>
      <span className="flex items-center gap-3">
        <PolledToggle entry={entry} signal={signal} onTogglePolled={props.onTogglePolled} />
        <span className="text-[12px] text-ui-faint">
          {pages.length === 0 ? 'not used' : `pages ${pages.join(', ')}`}
        </span>
      </span>
    </div>
  )
}

export const Obd2Table = ({
  signals,
  usage,
  intervalMs,
  intervals,
  onInterval,
  ...row
}: Obd2TableProps) => (
  <div className="min-h-0 flex-1 overflow-auto">
    <div className="max-w-[620px] px-6 pt-5">
      <p className="mb-[18px] text-pretty text-[14.5px] leading-[1.6] text-ui-muted">{CONTEXT}</p>
      <PollRate intervalMs={intervalMs} intervals={intervals} onInterval={onInterval} />
    </div>
    <Obd2Header />
    {OBD2_MODE01_PIDS.map((entry) => (
      <Obd2Row
        key={entry.pid}
        entry={entry}
        signal={signals.find((candidate) => candidate.name === entry.signal)}
        pages={usage.get(entry.signal) ?? []}
        {...row}
      />
    ))}
  </div>
)
