import { OBD2_MODE01_PIDS } from '@canshift/core'
import type { SignalDef } from '@canshift/core'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { STRINGS } from '../../strings'
import type { DisplayUnits } from '../../hooks/useDisplayUnits'
import type { SignalUsage } from '../../hooks/useSignalUsage'
import { formatSignalValue } from '../../lib/format'
import { pagesText } from '../../lib/car/obd-pages'
import { signalName } from '../../lib/sync/describe'

const C = STRINGS.car

export interface Obd2TableProps {
  units: DisplayUnits
  signals: readonly SignalDef[]
  values: Record<string, number>
  usage: SignalUsage
  onTogglePolled: (signalName: string, polled: boolean) => void
}

type Obd2Entry = (typeof OBD2_MODE01_PIDS)[number]

type Obd2RowProps = Pick<Obd2TableProps, 'values' | 'units' | 'onTogglePolled'> & {
  entry: Obd2Entry
  signal: SignalDef | undefined
  pages: readonly number[]
}

const hex = (pid: number): string => `0x${pid.toString(16).toUpperCase().padStart(2, '0')}`

const statusText = (signal: SignalDef | undefined, pages: readonly number[]): string => {
  if (signal === undefined) return C.notInThisCar
  const polled = signal.polling === undefined ? C.notPolled : C.polled
  return `${polled} · ${pagesText(pages)}`
}

const shownValue = ({ entry, values, units }: Obd2RowProps): string => {
  const raw = values[entry.signal]
  if (raw === undefined) return formatSignalValue(undefined)
  const value = formatSignalValue(units.valueOf(raw, entry.unit))
  return `${value} ${units.unitOf(entry.unit)}`.trim()
}

const PolledSwitch = ({ entry, signal, onTogglePolled }: Obd2RowProps) => {
  if (signal === undefined) return <span aria-hidden="true" className="w-11" />
  const polled = signal.polling !== undefined
  return (
    <Switch
      checked={polled}
      aria-label={C.pollSignal(signalName(entry.signal))}
      onCheckedChange={(checked) => {
        onTogglePolled(entry.signal, checked)
      }}
    />
  )
}

const Obd2Row = (props: Obd2RowProps) => {
  const { entry, signal, pages } = props
  return (
    <li
      className={cn(
        'grid min-h-[60px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-app-divider px-4 py-2 last:border-b-0',
        signal === undefined && 'text-app-muted'
      )}
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[15px]" title={entry.description}>
          {signalName(entry.signal)}
        </span>
        <span className="text-[13px] text-app-muted">
          {C.pid(hex(entry.pid))} · {statusText(signal, pages)}
        </span>
      </span>
      <span className="font-num text-[15px] tabular-nums">{shownValue(props)}</span>
      <PolledSwitch {...props} />
    </li>
  )
}

export const Obd2Table = ({ signals, usage, ...row }: Obd2TableProps) => (
  <ul className="overflow-hidden rounded-card border border-app-border">
    {OBD2_MODE01_PIDS.map((entry) => (
      <Obd2Row
        key={entry.pid}
        entry={entry}
        signal={signals.find((candidate) => candidate.name === entry.signal)}
        pages={usage.get(entry.signal) ?? []}
        {...row}
      />
    ))}
  </ul>
)
