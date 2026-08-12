import type { BenchEntry } from '../../lib/bench-entry'
import { formatRelativeDate } from '../../lib/bench-entry'
import { ConfigThumbnail } from './ConfigThumbnail'

export interface BenchRowProps {
  entry: BenchEntry
  now: number
  onResume: (id: string) => void
}

export const BENCH_ROW = [
  'grid w-full grid-cols-[100px_minmax(0,1fr)_auto] items-center gap-5',
  'border-b border-solid border-brand-neutral-300 px-[22px] py-[18px] text-left',
  'transition-colors hover:bg-brand-neutral-200',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  'focus-visible:outline-brand-accent',
].join(' ')

export const BenchRow = ({ entry, now, onResume }: BenchRowProps) => (
  <button
    type="button"
    className={BENCH_ROW}
    onClick={() => {
      onResume(entry.id)
    }}
  >
    <ConfigThumbnail theme={entry.theme} kicker={entry.kicker} pageCount={entry.pageCount} />
    <span className="flex min-w-0 flex-col gap-1.5">
      <span className="truncate text-[15.5px] font-extrabold text-brand-text">{entry.name}</span>
      <span className="font-mono text-[11.5px] leading-[1.5] text-brand-neutral-600">
        {entry.ecuLabel} · {entry.signalCount} signals
      </span>
    </span>
    <span className="flex flex-col items-end gap-1.5 whitespace-nowrap">
      <span className="font-mono text-[11.5px] text-brand-neutral-600">
        {formatRelativeDate(entry.updatedAt, now)}
      </span>
      <span className="font-mono text-[11.5px] text-brand-accent">RESUME →</span>
    </span>
  </button>
)
