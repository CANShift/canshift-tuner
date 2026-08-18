import type { ReactNode } from 'react'
import type { BenchEntry } from '../../lib/bench-entry'
import { FirstRunChoice } from './FirstRunChoice'
import { RecentConfigRow } from './RecentConfigRow'

export interface WelcomePaneProps {
  kicker: string
  entries: BenchEntry[]
  firstRun: boolean
  supported: boolean
  busy: boolean
  connectLabel: string
  lastError: string | null
  onConnect: () => void
  onEditOffline: () => void
  onStartFromDefaults: () => void
  onStartBlank: () => void
  onOpen: (id: string) => void
  onExport: (id: string, name: string) => void
  onDelete: (id: string) => void
  updateBand: ReactNode
}

const KICKER = 'font-mono text-[10.5px] tracking-[0.2em] text-ui-muted'

const SUPPORTED_BROWSERS = 'Chrome 89+ · Edge 89+ · Brave · Opera'

export const WelcomePane = ({
  kicker,
  entries,
  firstRun,
  supported,
  busy,
  connectLabel,
  lastError,
  onConnect,
  onEditOffline,
  onStartFromDefaults,
  onStartBlank,
  onOpen,
  onExport,
  onDelete,
  updateBand,
}: WelcomePaneProps) => (
  <div className="flex min-h-0 flex-1 flex-col">
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="max-w-[720px] px-11 pb-[60px] pt-12">
        <p className={`${KICKER} border-b-2 border-ui-rule pb-3`}>{kicker}</p>
        <h1 className="mb-3 mt-6 text-[38px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ui-ink">
          Plug the dash in.
        </h1>
        <p className="mb-7 max-w-[46ch] text-pretty text-[15px] leading-[1.6] text-ui-muted">
          USB-C, straight into the computer, then pick the port the browser offers. Everything else
          happens on the Dash tab.
        </p>

        {supported ? (
          <div className="mb-[46px] flex gap-px">
            <button
              type="button"
              disabled={busy}
              onClick={onConnect}
              className="cursor-pointer whitespace-nowrap border-0 bg-ui-accent px-[22px] py-[15px] text-left text-[13px] font-extrabold tracking-[0.09em] text-white hover:bg-ui-accent-hover disabled:opacity-70"
            >
              {connectLabel}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onEditOffline}
              className="cursor-pointer whitespace-nowrap border border-ui-ink bg-transparent px-[22px] py-[15px] text-left text-[13px] font-bold text-ui-ink hover:bg-ui-panel disabled:opacity-60"
            >
              Edit offline
            </button>
          </div>
        ) : (
          <UnsupportedBrowser />
        )}

        {lastError !== null && (
          <p className="mb-8 border-l-[3px] border-ui-danger bg-ui-panel px-3 py-2.5 font-mono text-[12.5px] text-ui-ink">
            {lastError}
          </p>
        )}

        {firstRun && (
          <FirstRunChoice onStartFromDefaults={onStartFromDefaults} onStartBlank={onStartBlank} />
        )}

        <p className={`${KICKER} border-b border-ui-line pb-2.5`}>RECENT CONFIGS</p>
        {entries.length === 0 ? (
          <EmptyBenchRow />
        ) : (
          entries.map((entry) => (
            <RecentConfigRow
              key={entry.id}
              entry={entry}
              onOpen={onOpen}
              onExport={onExport}
              onDelete={onDelete}
              deletable={entries.length > 1}
            />
          ))
        )}
      </div>
    </div>
    {updateBand}
  </div>
)

const EMPTY_BENCH_NAME = 'Nothing saved yet'
const EMPTY_BENCH_META = 'press SAVE and it appears here'

const EmptyBenchRow = () => (
  <div className="flex max-w-[440px] items-baseline gap-[18px] border-b border-ui-line py-[15px] pl-0 pr-3">
    <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ui-muted">
      {EMPTY_BENCH_NAME}
    </span>
    <span className="min-w-0 truncate font-mono text-[11.5px] text-ui-faint">
      {EMPTY_BENCH_META}
    </span>
  </div>
)

const UnsupportedBrowser = () => (
  <div
    role="alert"
    className="mb-[46px] max-w-[520px] border-l-[3px] border-ui-warning bg-ui-panel px-[18px] py-4"
  >
    <p className="text-[14.5px] font-bold text-ui-ink">
      This browser has no WebSerial, so it cannot reach the dash.
    </p>
    <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ui-muted">
      Open this page in {SUPPORTED_BROWSERS}. Everything except connecting still works here.
    </p>
  </div>
)
