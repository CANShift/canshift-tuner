import type { SignalDef } from '@canshift/core'
import type { CanFrameStats } from '../../stores/can-scan/accumulator'
import { formatFrameIdHex } from '../../utils/frame-id'
import { formatPayload } from '../can-bus/can-format'

const GRID = 'grid min-w-[780px] grid-cols-[128px_96px_minmax(0,1fr)_170px_190px] gap-8'
const RATE_DECIMALS = 0
const UNBOUND = 'not bound'

export interface BusScanPanelProps {
  frames: readonly CanFrameStats[]
  totalFrames: number
  signals: readonly SignalDef[]
  boundTo: ReadonlyMap<number, string>
  onAssign: (frameId: number, signalName: string) => void
  onClear: () => void
}

const plural = (count: number): string => `${String(count)} id${count === 1 ? '' : 's'}`

const ScanHeader = ({
  ids,
  totalFrames,
  onClear,
}: {
  ids: number
  totalFrames: number
  onClear: () => void
}) => (
  <div className="flex items-center gap-3.5 px-6 py-[11px] font-mono text-[10.5px] tracking-[0.16em] text-ui-muted">
    <span>BUS SCAN</span>
    <span>
      {plural(ids)} · {totalFrames} frames
    </span>
    <button
      type="button"
      onClick={onClear}
      className="ml-auto cursor-pointer border-0 bg-transparent font-[inherit] text-[10.5px] tracking-[0.16em] text-ui-muted hover:text-ui-ink"
    >
      CLEAR
    </button>
  </div>
)

type ScanRowProps = Pick<BusScanPanelProps, 'signals' | 'boundTo' | 'onAssign'> & {
  frame: CanFrameStats
}

const AssignSelect = ({ frame, signals, onAssign }: Omit<ScanRowProps, 'boundTo'>) => (
  <select
    value=""
    aria-label={`Assign ${formatFrameIdHex(frame.id)}`}
    onChange={(e) => {
      if (e.target.value.length > 0) onAssign(frame.id, e.target.value)
    }}
    className="border border-ui-line-strong bg-transparent px-1.5 py-1 font-mono text-[13px] text-ui-ink"
  >
    <option value="">assign to…</option>
    {signals.map((signal) => (
      <option key={signal.name} value={signal.name}>
        {signal.name}
      </option>
    ))}
  </select>
)

const ScanRow = (props: ScanRowProps) => {
  const { frame, boundTo } = props
  return (
    <div
      className={`${GRID} items-center border-t border-ui-line px-6 py-[11px] font-mono text-[13.5px] text-ui-ink`}
    >
      <span className="text-ui-accent">{formatFrameIdHex(frame.id)}</span>
      <span className="text-ui-muted">{frame.rateHz.toFixed(RATE_DECIMALS)} Hz</span>
      <span className="truncate tracking-[0.06em]">
        {formatPayload(frame.lastPayload, frame.lastDlc)}
      </span>
      <span className="truncate text-ui-muted">{boundTo.get(frame.id) ?? UNBOUND}</span>
      <AssignSelect {...props} />
    </div>
  )
}

export const BusScanPanel = ({ frames, totalFrames, onClear, ...rows }: BusScanPanelProps) => (
  <div className="max-h-[232px] shrink-0 overflow-auto border-b-2 border-ui-rule bg-ui-panel">
    <ScanHeader ids={frames.length} totalFrames={totalFrames} onClear={onClear} />
    {frames.map((frame) => (
      <ScanRow key={frame.id} frame={frame} {...rows} />
    ))}
  </div>
)
