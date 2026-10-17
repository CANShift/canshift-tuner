import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { signalName } from '../../lib/sync/describe'
import { useLiveSession } from '../../hooks/useLiveSession'
import { useSignalSelection } from '../../hooks/useLiveView'
import { useSignalUsage } from '../../hooks/useSignalUsage'
import { useSignalStore } from '../../stores/signal.store'
import { LiveControls } from '../live-data/LiveControls'
import { SignalStrips } from '../live-data/SignalStrips'

const DEFAULT_PLOTTED = 3

const useDefaultPlotted = (): string[] => {
  const signals = useSignalStore((s) => s.signals)
  const usage = useSignalUsage()
  return useMemo(
    () =>
      signals
        .filter((s) => usage.has(s.name))
        .slice(0, DEFAULT_PLOTTED)
        .map((s) => s.name),
    [signals, usage]
  )
}

interface PickerProps {
  selected: readonly string[]
  onToggle: (name: string) => void
}

const PlotPicker = ({ selected, onToggle }: PickerProps) => {
  const signals = useSignalStore((s) => s.signals)
  return (
    <div className="flex flex-wrap gap-1.5">
      {signals.map((signal) => (
        <button
          key={signal.name}
          type="button"
          aria-pressed={selected.includes(signal.name)}
          onClick={() => onToggle(signal.name)}
          className={cn(
            'h-9 rounded-control border px-3 text-sm',
            selected.includes(signal.name)
              ? 'border-app-text bg-app-text text-app-bg'
              : 'border-app-border text-app-secondary'
          )}
        >
          {signalName(signal.name)}
        </button>
      ))}
    </div>
  )
}

export const LivePlotCard = () => {
  const signals = useSignalStore((s) => s.signals)
  const session = useLiveSession(signals)
  const plot = useSignalSelection(useDefaultPlotted())
  return (
    <div className="flex flex-col gap-3 p-3.5 lg:h-[max(540px,calc(100dvh-320px))] lg:p-5">
      <LiveControls session={session} />
      <div className="min-h-0 lg:flex-1">
        <SignalStrips selected={plot.selected} samples={session.history} />
      </div>
      <PlotPicker selected={plot.selected} onToggle={plot.toggle} />
    </div>
  )
}
