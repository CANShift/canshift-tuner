import type { SignalDef } from '@canshift/core'
import type { CanFrameStats } from '../../stores/can-scan/accumulator'
import { formatFrameIdHex } from '../../utils/frame-id'

const GRID = 'grid grid-cols-[128px_96px_minmax(0,1fr)_170px_190px] gap-8'
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

const payloadOf = (frame: CanFrameStats): string =>
  frame.lastPayload
    .slice(0, frame.lastDlc)
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ')

export const BusScanPanel = ({
  frames,
  totalFrames,
  signals,
  boundTo,
  onAssign,
  onClear,
}: BusScanPanelProps) => (
  <div className="max-h-[232px] shrink-0 overflow-y-auto border-b-2 border-ui-rule bg-ui-panel">
    <div className="flex items-center gap-3.5 px-6 py-[11px] font-mono text-[10.5px] tracking-[0.16em] text-ui-muted">
      <span>BUS SCAN</span>
      <span>
        {frames.length} id{frames.length === 1 ? '' : 's'} · {totalFrames} frames
      </span>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto cursor-pointer border-0 bg-transparent font-[inherit] text-[10.5px] tracking-[0.16em] text-ui-muted hover:text-ui-ink"
      >
        CLEAR
      </button>
    </div>

    {frames.map((frame) => (
      <div
        key={frame.id}
        className={`${GRID} items-center border-t border-ui-line px-6 py-[11px] font-mono text-[13.5px] text-ui-ink`}
      >
        <span className="text-ui-accent">{formatFrameIdHex(frame.id)}</span>
        <span className="text-ui-muted">{frame.rateHz.toFixed(RATE_DECIMALS)} Hz</span>
        <span className="truncate tracking-[0.06em]">{payloadOf(frame)}</span>
        <span className="truncate text-ui-muted">{boundTo.get(frame.id) ?? UNBOUND}</span>
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
      </div>
    ))}
  </div>
)
