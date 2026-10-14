import type { SignalDef } from '@canshift/core'
import type { DisplayUnits } from '../../hooks/useDisplayUnits'
import type { SignalUsage } from '../../hooks/useSignalUsage'
import type { SignalFrame } from '../../lib/signal-frames'
import { InlineInput } from './InlineInput'
import { SignalRow, type SignalPatch } from './SignalRow'

export interface CanSignalTableProps {
  frames: readonly SignalFrame[]
  values: Record<string, number>
  usage: SignalUsage
  units: DisplayUnits
  onPatch: SignalPatch
  onRenameFrame: (from: string, to: string) => void
  plotted: readonly string[]
  onTogglePlot: (name: string) => void
}

const plural = (count: number): string => `${String(count)} signal${count === 1 ? '' : 's'}`

interface FrameHeaderProps {
  frame: SignalFrame
  onRenameFrame: CanSignalTableProps['onRenameFrame']
}

const FrameHeader = ({ frame, onRenameFrame }: FrameHeaderProps) => (
  <div className="flex items-center gap-3 border-b border-ui-line-strong bg-ui-panel px-3 py-1 md:px-4">
    <InlineInput
      value={frame.frameId}
      label={`CAN frame ${frame.frameId}`}
      onCommit={(next) => {
        if (next.length > 0) onRenameFrame(frame.frameId, next)
      }}
      className="w-28 text-[13px] font-bold text-ui-ink"
    />
    <span className="text-[12px] text-ui-muted">{plural(frame.signals.length)}</span>
  </div>
)

type FrameGroupProps = Omit<CanSignalTableProps, 'frames'> & { frame: SignalFrame }

const FrameGroup = ({ frame, onRenameFrame, ...rows }: FrameGroupProps) => (
  <section aria-label={`CAN frame ${frame.frameId}`}>
    <FrameHeader frame={frame} onRenameFrame={onRenameFrame} />
    {frame.signals.map((signal: SignalDef) => (
      <SignalRow
        key={signal.name}
        signal={signal}
        value={rows.values[signal.name]}
        pages={rows.usage.get(signal.name) ?? []}
        units={rows.units}
        onPatch={rows.onPatch}
        plotted={rows.plotted.includes(signal.name)}
        onTogglePlot={rows.onTogglePlot}
      />
    ))}
  </section>
)

export const CanSignalTable = ({ frames, ...rest }: CanSignalTableProps) => (
  <div>
    {frames.map((frame) => (
      <FrameGroup key={frame.frameId} frame={frame} {...rest} />
    ))}
    {frames.length === 0 && (
      <p className="px-4 py-6 text-[13px] text-ui-muted">No signal matches.</p>
    )}
  </div>
)
