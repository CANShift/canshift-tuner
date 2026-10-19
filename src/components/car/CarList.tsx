import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { STRINGS } from '../../strings'
import { carOptions, matchingCars, type CarOption } from '../../lib/car/car-options'
import { useCarLabel } from '../../hooks/useCarLabel'
import { useSignalStore } from '../../stores/signal.store'

export interface CarListProps {
  onPick: (key: string) => void
}

const CarRow = ({
  option,
  current,
  onPick,
}: {
  option: CarOption
  current: boolean
  onPick: (key: string) => void
}) => (
  <li>
    <button
      type="button"
      aria-current={current}
      onClick={() => onPick(option.key)}
      className="flex min-h-[52px] w-full flex-col justify-center border-b border-app-divider px-3.5 py-2 text-left aria-current:bg-app-surface-2"
    >
      <span className="text-[15px]">{option.label}</span>
      <span className="text-xs text-app-muted">{option.make}</span>
    </button>
  </li>
)

export const CarList = ({ onPick }: CarListProps) => {
  const [query, setQuery] = useState('')
  const currentKey = useSignalStore((s) => s.selectedProfileKey)
  const label = useCarLabel()
  const options = useMemo(() => carOptions(currentKey, label), [currentKey, label])
  const shown = matchingCars(options, query)
  return (
    <>
      <Input
        type="search"
        value={query}
        placeholder={STRINGS.car.search}
        aria-label={STRINGS.car.search}
        onChange={(e) => setQuery(e.target.value)}
      />
      {shown.length === 0 && <p className="text-sm text-app-muted">{STRINGS.car.noCarMatch}</p>}
      <ul className="flex flex-col overflow-y-auto rounded-[12px] border border-app-border bg-app-bg">
        {shown.map((option) => (
          <CarRow
            key={option.key}
            option={option}
            current={option.key === currentKey}
            onPick={onPick}
          />
        ))}
      </ul>
    </>
  )
}
