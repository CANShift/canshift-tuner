import { useState } from 'react'
import type { SignalDef } from '@canshift/core'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import type { DisplayUnits } from '../../hooks/useDisplayUnits'
import { byteRangeLabel, parseByteRange } from '../../lib/signal-bytes'
import { displayLabelForSignal } from '../../utils/signal-labels'
import { InlineInput } from './InlineInput'
import { SignalValueCell } from './SignalValueCell'

export type SignalPatch = (name: string, patch: Partial<SignalDef>) => void

export interface SignalRowProps {
  signal: SignalDef
  value: number | undefined
  pages: readonly number[]
  units: DisplayUnits
  onPatch: SignalPatch
  plotted: boolean
  onTogglePlot: (name: string) => void
}

export const SIGNAL_GRID = cn(
  'grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-4',
  "[grid-template-areas:'label_value_more'_'meta_meta_meta'_'detail_detail_detail']",
  'md:grid-cols-[minmax(0,1fr)_96px_150px_112px_24px]',
  "md:[grid-template-areas:'label_bytes_value_pages_more'_'detail_detail_detail_detail_detail']"
)

const BytesCell = ({ signal, onPatch }: Pick<SignalRowProps, 'signal' | 'onPatch'>) => {
  const { noun, range } = byteRangeLabel(signal.startByte, signal.byteLength)
  return (
    <span className="flex items-center gap-1 text-[12px] text-ui-muted md:[grid-area:bytes]">
      {noun}
      <InlineInput
        value={range}
        label={`Bytes for ${signal.name}`}
        validate={(next) => parseByteRange(next) !== null}
        onCommit={(next) => {
          const parsed = parseByteRange(next)
          if (parsed) onPatch(signal.name, parsed)
        }}
        className="w-14 text-[12.5px] text-ui-ink"
      />
    </span>
  )
}

const PagesCell = ({ pages }: { pages: readonly number[] }) => (
  <span className="flex flex-wrap gap-1 text-[11.5px] md:[grid-area:pages]">
    {pages.length === 0 ? (
      <span className="text-ui-faint">not used</span>
    ) : (
      pages.map((page) => (
        <span key={page} className="border border-ui-line-strong px-1.5 font-mono">
          {page}
        </span>
      ))
    )}
  </span>
)

type SignalNameProps = Pick<SignalRowProps, 'plotted' | 'onTogglePlot'> & { name: string }

const RowMeta = ({
  signal,
  pages,
  onPatch,
}: Pick<SignalRowProps, 'signal' | 'pages' | 'onPatch'>) => (
  <span className="flex items-center gap-3 [grid-area:meta] md:contents">
    <span className="font-mono text-[11px] text-ui-muted md:hidden">{signal.name}</span>
    <BytesCell signal={signal} onPatch={onPatch} />
    <PagesCell pages={pages} />
  </span>
)

const SignalName = ({ name, plotted, onTogglePlot }: SignalNameProps) => (
  <span className="flex min-w-0 items-center gap-2 [grid-area:label]">
    <Checkbox
      checked={plotted}
      aria-label={`Plot ${displayLabelForSignal(name)}`}
      onCheckedChange={() => onTogglePlot(name)}
    />
    <span className="shrink-0 text-[13.5px] font-bold">{displayLabelForSignal(name)}</span>
    <span className="hidden truncate font-mono text-[11px] text-ui-muted md:inline">{name}</span>
  </span>
)

const FrameDetail = ({ signal, onPatch }: Pick<SignalRowProps, 'signal' | 'onPatch'>) => (
  <span className="flex items-center gap-2 pb-1.5 text-[12px] text-ui-muted [grid-area:detail]">
    Move to CAN frame
    <InlineInput
      value={signal.canFrameId}
      label={`CAN frame for ${signal.name}`}
      onCommit={(next) => {
        if (next.length > 0) onPatch(signal.name, { canFrameId: next })
      }}
      className="w-24 text-[12.5px] text-ui-ink"
    />
  </span>
)

const MoreToggle = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => (
  <button
    type="button"
    aria-expanded={open}
    title="Move this signal to another CAN frame"
    onClick={onToggle}
    className="cursor-pointer self-center border-0 bg-transparent px-1 text-ui-muted [grid-area:more] hover:text-ui-ink"
  >
    ⋯
  </button>
)

export const SignalRow = ({
  signal,
  value,
  pages,
  units,
  onPatch,
  plotted,
  onTogglePlot,
}: SignalRowProps) => {
  const [detailOpen, setDetailOpen] = useState(false)
  const unused = pages.length === 0
  return (
    <div
      className={cn(
        SIGNAL_GRID,
        'min-h-8 items-center border-b border-ui-line px-3 py-1 hover:bg-ui-panel md:px-4',
        unused ? 'text-ui-faint' : 'text-ui-ink'
      )}
    >
      <SignalName name={signal.name} plotted={plotted} onTogglePlot={onTogglePlot} />
      <SignalValueCell signal={signal} units={units} value={value} className="[grid-area:value]" />
      <RowMeta signal={signal} pages={pages} onPatch={onPatch} />
      <MoreToggle open={detailOpen} onToggle={() => setDetailOpen((open) => !open)} />
      {detailOpen && <FrameDetail signal={signal} onPatch={onPatch} />}
    </div>
  )
}
