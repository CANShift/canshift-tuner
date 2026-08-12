import type { BenchEntry } from '../../lib/bench-entry'
import { BENCH_ROW, BenchRow } from './BenchRow'
import { DefaultsPicker } from './DefaultsPicker'

export interface BenchPanelProps {
  entries: BenchEntry[]
  now: number
  onResume: (id: string) => void
  onNewConfig: () => void
  onStartFromPageSet: (pageSetId: string) => void
  onExport: () => void
  onImport: () => void
}

const TOOLBAR = [
  'flex h-10 shrink-0 items-center justify-between',
  'border-b-2 border-solid border-brand-neutral-300 px-[22px]',
  'font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-neutral-600',
].join(' ')

const FOOTER = [
  'flex shrink-0 flex-wrap items-center justify-between gap-3',
  'border-t-2 border-solid border-brand-neutral-300 py-3.5 pl-[22px] pr-20',
  'font-mono text-[11px] text-brand-neutral-600',
].join(' ')

const FOOTER_ACTION = [
  'text-brand-accent underline underline-offset-2',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  'focus-visible:outline-brand-accent',
].join(' ')

export const BenchPanel = ({
  entries,
  now,
  onResume,
  onNewConfig,
  onStartFromPageSet,
  onExport,
  onImport,
}: BenchPanelProps) => (
  <section className="flex min-h-0 flex-col overflow-hidden bg-brand-neutral-100">
    <div className={TOOLBAR}>
      <span>{entries.length === 0 ? 'Start from a default' : 'Your bench'}</span>
      <span>
        {entries.length} config{entries.length === 1 ? '' : 's'} · local
      </span>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto">
      {entries.length === 0 ? (
        <DefaultsPicker onStartFromPageSet={onStartFromPageSet} />
      ) : (
        <>
          {entries.map((entry) => (
            <BenchRow key={entry.id} entry={entry} now={now} onResume={onResume} />
          ))}
          <button type="button" className={BENCH_ROW} onClick={onNewConfig}>
            <span className="text-[26px] leading-none text-brand-accent">+</span>
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[15.5px] font-extrabold text-brand-text">
                Start a new config
              </span>
              <span className="font-mono text-[11.5px] leading-[1.5] text-brand-neutral-600">
                from a blank dash, or from one of the six defaults
              </span>
            </span>
            <span />
          </button>
        </>
      )}
    </div>
    <div className={FOOTER}>
      <span>
        Configs live in this browser.{' '}
        <button type="button" className={FOOTER_ACTION} onClick={onExport}>
          Export ↗
        </button>
      </span>
      <button type="button" className={FOOTER_ACTION} onClick={onImport}>
        Import a config file
      </button>
    </div>
  </section>
)
