import type { HeapStatsEntry } from '../../stores/device.store'
import { HeapStatsSparkline } from './HeapStatsSparkline'
import { formatBytes } from '../../lib/format'

export interface HeapStatsPanelProps {
  history: HeapStatsEntry[]
}

export const HeapStatsPanel = ({ history }: HeapStatsPanelProps) => {
  if (history.length === 0) {
    return (
      <div className={EMPTY}>
        Waiting for the firmware to send a heap snapshot. The first frame lands within ~30 s of
        connect.
      </div>
    )
  }

  const latest = history[history.length - 1]
  if (!latest) return null
  const fragmentationPct = formatFragmentationPct(latest.freeInternal, latest.largestInternal)
  const psramRow =
    latest.freePsram !== null && latest.largestPsram !== null
      ? `${formatBytes(latest.freePsram)} · largest ${formatBytes(latest.largestPsram)}`
      : '— (no PSRAM)'

  return (
    <>
      <Row label="Free internal" value={formatBytes(latest.freeInternal)} />
      <Row label="Largest free block" value={formatBytes(latest.largestInternal)} />
      <Row label="Fragmentation" value={fragmentationPct} />
      <Row label="PSRAM free" value={psramRow} />
      <div className={SPARKLINE_ROW}>
        <HeapStatsSparkline history={history} />
      </div>
    </>
  )
}

interface RowProps {
  label: string
  value: string
}

const Row = ({ label, value }: RowProps) => {
  return (
    <div className={ROW}>
      <span className="text-text-dim">{label}</span>
      <span className={VALUE}>{value}</span>
    </div>
  )
}

const formatFragmentationPct = (free: number, largest: number): string => {
  if (free === 0) return '—'
  const ratio = 1 - largest / free
  return `${(ratio * 100).toFixed(1)} %`
}

const ROW = [
  'flex items-center justify-between px-3.5 py-[11px]',
  'border-b border-solid border-border text-[13px]',
].join(' ')

const VALUE = 'font-mono font-medium tabular-nums text-text'

const SPARKLINE_ROW = 'border-t border-solid border-border bg-bg-inset px-3.5 py-3'

const EMPTY = 'bg-bg-inset p-3.5 text-[11px] text-text-muted'
