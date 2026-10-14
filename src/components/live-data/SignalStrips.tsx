import { useMemo } from 'react'
import type { LiveSample } from '../../hooks/useLiveSampler'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { useSignalStore } from '../../stores/signal.store'
import { SignalStrip } from './SignalStrip'
import { TimeAxis } from './TimeAxis'
import { buildStrip, timeWindowOf } from './strip-series'

export interface SignalStripsProps {
  selected: readonly string[]
  samples: readonly LiveSample[]
}

const useSignalUnits = (): ReadonlyMap<string, string> => {
  const signals = useSignalStore((s) => s.signals)
  return useMemo(() => new Map(signals.map((signal) => [signal.name, signal.unit])), [signals])
}

const useStrips = (selected: readonly string[], samples: readonly LiveSample[]) => {
  const window = useMemo(() => timeWindowOf(samples), [samples])
  const strips = useMemo(
    () => selected.map((name) => ({ name, series: buildStrip(name, samples, window) })),
    [selected, samples, window]
  )
  return { window, strips }
}

export const SignalStrips = ({ selected, samples }: SignalStripsProps) => {
  const { window, strips } = useStrips(selected, samples)
  const unitsByName = useSignalUnits()
  const units = useDisplayUnits()
  if (selected.length === 0) {
    return (
      <p className="py-6 text-center text-[12.5px] text-ui-muted">
        Tick a signal in the table to plot it.
      </p>
    )
  }
  return (
    <div className="flex min-h-0 flex-col min-[1100px]:h-full">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {strips.map((strip) => (
          <SignalStrip
            key={strip.name}
            name={strip.name}
            unit={unitsByName.get(strip.name) ?? ''}
            series={strip.series}
            units={units}
          />
        ))}
      </div>
      <TimeAxis window={window} />
    </div>
  )
}
