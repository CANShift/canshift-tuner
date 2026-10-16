import { cn } from '@/lib/utils'
import { STRINGS } from '../../strings'
import type { SignalRow } from '../../lib/car/signal-rows'
import { signalName } from '../../lib/sync/describe'
import { formatSignalValue } from '../../lib/format'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { UiIcon } from '../icons/UiIcons'

export interface SignalRowItemProps {
  row: SignalRow
  onAdjust: (signal: string) => void
}

const useShownValue = (row: SignalRow): string => {
  const units = useDisplayUnits()
  if (row.value === undefined) return STRINGS.car.noDataShort
  const value = formatSignalValue(units.valueOf(row.value, row.signal.unit))
  return `${value} ${units.unitOf(row.signal.unit)}`.trim()
}

const GRID =
  'grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 lg:grid-cols-[2fr_1.4fr_1fr_96px]'

const Dot = ({ live, className }: { live: boolean; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn('size-2 rounded-full', live ? 'bg-app-success' : 'bg-app-warning', className)}
  />
)

const RowStatus = ({ live, tone }: { live: boolean; tone: string }) => (
  <span className={cn('hidden items-center gap-2 text-sm lg:inline-flex', tone)}>
    <Dot live={live} />
    {live ? STRINGS.car.live : STRINGS.car.noDataShort}
  </span>
)

const RowEnd = () => (
  <>
    <UiIcon name="chevronRight" className="text-app-muted lg:hidden" />
    <span className="hidden h-9 items-center justify-self-end rounded-[8px] border border-app-border px-3 text-sm lg:inline-flex">
      {STRINGS.car.adjust}
    </span>
  </>
)

export const SignalRowItem = ({ row, onAdjust }: SignalRowItemProps) => {
  const tone = row.live ? 'text-app-text' : 'text-app-warning'
  const shown = useShownValue(row)
  return (
    <li className="border-b border-app-divider last:border-b-0">
      <button
        type="button"
        onClick={() => {
          onAdjust(row.signal.name)
        }}
        className={cn(GRID, 'min-h-[52px] w-full px-3.5 text-left text-[15px] lg:min-h-12 lg:px-4')}
      >
        <Dot live={row.live} className="lg:hidden" />
        <span>{signalName(row.signal.name)}</span>
        <span className={cn('font-num', tone)}>{shown}</span>
        <RowStatus live={row.live} tone={tone} />
        <RowEnd />
      </button>
    </li>
  )
}
