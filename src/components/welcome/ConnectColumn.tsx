import type { ReactNode } from 'react'
import { Spinner } from '@/components/ui/spinner'

export interface ConnectColumnProps {
  supported: boolean
  busy: boolean
  reconnecting: boolean
  lastError: string | null
  onConnect: (() => void) | undefined
  onExploreSimulation: (() => void) | undefined
  footerLinks: ReactNode
}

const STEPS = [
  { title: 'Plug the dash in', body: 'USB-C, straight into the computer. No hub.' },
  { title: 'Pick the port', body: 'The browser asks which USB port to use.' },
  { title: 'Start tuning', body: 'Edit pages and widgets — the dash updates as you type.' },
]

const SUPPORTED_BROWSERS = ['Chrome 89+', 'Edge 89+', 'Brave', 'Opera']

const KICKER = 'font-mono text-[10.5px] uppercase tracking-[0.2em] text-brand-neutral-600'

const FOCUS = [
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  'focus-visible:outline-brand-accent',
].join(' ')

const PRIMARY_ACTION = [
  'bg-brand-accent px-[22px] py-[15px] text-left text-[13px] font-extrabold uppercase',
  'tracking-[0.1em] whitespace-nowrap text-white hover:bg-brand-accent-600',
  'disabled:opacity-70',
  FOCUS,
].join(' ')

const SECONDARY_ACTION = [
  'border border-solid border-brand-neutral-400 bg-transparent px-[22px] py-[15px]',
  'text-left text-[13px] font-bold whitespace-nowrap text-brand-text',
  'hover:bg-brand-neutral-200 disabled:opacity-60',
  FOCUS,
].join(' ')

export const ConnectColumn = ({
  supported,
  busy,
  reconnecting,
  lastError,
  onConnect,
  onExploreSimulation,
  footerLinks,
}: ConnectColumnProps) => (
  <section className="flex min-h-0 flex-col overflow-y-auto border-r-2 border-solid border-brand-neutral-300 px-10 pt-11">
    <p className={`${KICKER} border-b-2 border-solid border-brand-neutral-300 pb-3.5`}>
      No device connected
    </p>
    <h1 className="mt-9 text-[38px] leading-[1.04] font-extrabold tracking-[-0.035em] text-brand-text">
      Configure your dash, live.
    </h1>
    <p className="mt-5 max-w-[42ch] text-[15px] leading-[1.6] text-brand-neutral-700">
      Pages, CAN bindings and OBD-II polling, edited in the browser against the dash on your desk.
      Nothing to install, nothing to deploy.
    </p>

    {supported ? (
      <div className="mt-8 flex flex-wrap gap-px">
        <button type="button" disabled={busy} onClick={onConnect} className={PRIMARY_ACTION}>
          {busy ? (
            <>
              <Spinner size="sm" />
              {reconnecting ? 'Reconnecting…' : 'Connecting…'}
            </>
          ) : (
            'Connect device'
          )}
        </button>
        {onExploreSimulation && (
          <button
            type="button"
            disabled={busy}
            onClick={onExploreSimulation}
            className={SECONDARY_ACTION}
          >
            Explore with sample data
          </button>
        )}
      </div>
    ) : (
      <UnsupportedBrowserPanel />
    )}

    {lastError !== null && (
      <p className="mt-4 border border-solid border-destructive px-3.5 py-2.5 text-[13px] text-destructive">
        {lastError}
      </p>
    )}

    <p className={`${KICKER} mt-11 border-b border-solid border-brand-neutral-300 pb-2.5`}>
      To connect
    </p>
    <ol className="m-0 list-none p-0">
      {STEPS.map((step, index) => (
        <li
          key={step.title}
          className="grid grid-cols-[16px_minmax(0,1fr)] gap-x-4 border-b border-solid border-brand-neutral-300 py-4"
        >
          <span className="font-mono text-[12px] text-brand-neutral-600">0{index + 1}</span>
          <span className="flex flex-col gap-1">
            <span className="text-[14px] font-bold text-brand-text">{step.title}</span>
            <span className="text-[13.5px] leading-[1.5] text-brand-neutral-700">{step.body}</span>
          </span>
        </li>
      ))}
    </ol>

    {footerLinks !== undefined && (
      <footer className="mt-auto flex flex-wrap items-center gap-2 py-8 font-mono text-[11px]">
        {footerLinks}
      </footer>
    )}
  </section>
)

const UnsupportedBrowserPanel = () => (
  <div
    role="alert"
    className="mt-8 border border-solid border-brand-neutral-400 px-5 py-[18px] text-[13px] text-brand-neutral-700"
  >
    <p className="font-bold text-brand-text">WebSerial isn&apos;t available in this browser</p>
    <p className="mt-1.5">
      CANShift Tuner needs the WebSerial API to talk to the dash over USB. Open this page in one of
      the supported browsers — or copy the URL and paste it into the new one:
    </p>
    <ul className="m-0 mt-3 list-none p-0 font-mono text-[12px]">
      {SUPPORTED_BROWSERS.map((browser) => (
        <li key={browser} className="py-0.5">
          · {browser}
        </li>
      ))}
    </ul>
  </div>
)
