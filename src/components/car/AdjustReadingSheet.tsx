import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import type { SignalDef } from '@canshift/core'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { useLiveSignals } from '../../hooks/useLiveSignals'
import { useSignalStore } from '../../stores/signal.store'
import { ReadingTiles } from './ReadingTiles'
import { ScalingInput } from './ScalingInput'

const C = STRINGS.car

export interface AdjustReadingSheetProps {
  signalName: string | null
  onClose: () => void
}

const numberOr = (text: string, fallback: number): number => {
  const value = Number(text.replace(',', '.'))
  return text.trim().length === 0 || Number.isNaN(value) ? fallback : value
}

type Update = ReturnType<typeof useSignalStore.getState>['updateSignal']

const NumberFields = ({ signal, update }: { signal: SignalDef; update: Update }) => (
  <>
    <ScalingInput
      id={`scale-${signal.name}`}
      label={C.multiplyBy}
      value={String(signal.scale)}
      onCommit={(text) => update(signal.name, { scale: numberOr(text, signal.scale) })}
    />
    <ScalingInput
      id={`offset-${signal.name}`}
      label={C.thenAdd}
      value={String(signal.offset)}
      onCommit={(text) => update(signal.name, { offset: numberOr(text, signal.offset) })}
    />
    <ScalingInput
      id={`unit-${signal.name}`}
      label={C.unit}
      value={signal.unit}
      numeric={false}
      onCommit={(text) => update(signal.name, { unit: text.trim() })}
    />
  </>
)

const ScalingFields = ({ signal, catalogue }: { signal: SignalDef; catalogue: SignalDef }) => {
  const update = useSignalStore((s) => s.updateSignal)
  const reset = () =>
    update(signal.name, { scale: catalogue.scale, offset: catalogue.offset, unit: catalogue.unit })
  return (
    <>
      <NumberFields signal={signal} update={update} />
      <p className="rounded-control bg-app-surface-2 p-3 text-sm leading-snug text-app-secondary">
        {C.compareHint}
      </p>
      <button type="button" className="h-11 self-start text-[15px] text-[#ff6b6b]" onClick={reset}>
        {C.resetToCatalogue}
      </button>
    </>
  )
}

const useAdjusted = (name: string | null) => {
  const signal = useSignalStore((s) => s.signals.find((c) => c.name === name))
  const catalogue = useSignalStore((s) => s.profileSignals.find((c) => c.name === name)) ?? signal
  const live = useLiveSignals()[name ?? '']
  return { signal, catalogue, live }
}

export const AdjustReadingSheet = ({ signalName: name, onClose }: AdjustReadingSheetProps) => {
  const { signal, catalogue, live } = useAdjusted(name)
  return (
    <Sheet open={signal !== undefined} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="gap-4">
        {signal !== undefined && catalogue !== undefined && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 flex-col">
                <SheetTitle className="text-xl font-bold">{signalName(signal.name)}</SheetTitle>
                <SheetDescription className="text-[13px] text-app-muted">
                  {C.adjustReading}
                </SheetDescription>
              </div>
              <Button className="bg-app-text text-[15px] text-app-bg" onClick={onClose}>
                {C.done}
              </Button>
            </div>
            <ReadingTiles signal={signal} catalogue={catalogue} live={live} />
            <ScalingFields signal={signal} catalogue={catalogue} />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
