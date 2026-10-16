import type { SignalDef } from '@canshift/core'
import { STRINGS } from '../../strings'
import { formatSignalValue } from '../../lib/format'
import { rawFromShown, rescaled, sameScaling } from '../../lib/car/reading'

export interface ReadingTilesProps {
  signal: SignalDef
  catalogue: SignalDef
  live: number | undefined
}

const NO_VALUE = '—'

const Tile = ({
  label,
  value,
  note,
  strong,
}: {
  label: string
  value: string
  note: string
  strong?: boolean
}) => (
  <div
    className={
      strong
        ? 'flex flex-col gap-1 rounded-[12px] border-[1.5px] border-app-text bg-app-bg p-3'
        : 'flex flex-col gap-1 rounded-[12px] border border-app-border bg-app-bg p-3'
    }
  >
    <span className="text-[13px] text-app-muted">{label}</span>
    <span className="font-num text-[26px] font-bold leading-tight">{value}</span>
    <span className="text-xs text-app-muted">{note}</span>
  </div>
)

const withUnit = (value: number, unit: string): string =>
  `${formatSignalValue(value)} ${unit}`.trim()

export const ReadingTiles = ({ signal, catalogue, live }: ReadingTilesProps) => {
  const raw = live === undefined ? NO_VALUE : formatSignalValue(rawFromShown(live, catalogue))
  const shown =
    live === undefined ? NO_VALUE : withUnit(rescaled(live, catalogue, signal), signal.unit)
  const changed = live !== undefined && !sameScaling(signal, catalogue)
  const was = changed ? STRINGS.car.was(withUnit(live, catalogue.unit)) : ''
  return (
    <div className="grid grid-cols-2 gap-2">
      <Tile
        label={STRINGS.car.fromCar}
        value={raw}
        note={live === undefined ? STRINGS.car.noDataShort : STRINGS.car.live}
      />
      <Tile label={STRINGS.car.shownOnDash} value={shown} note={was} strong />
    </div>
  )
}
