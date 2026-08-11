import { Spinner } from '@/components/ui/spinner'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { BrandLockup } from '@/components/brand/BrandLockup'

const SUPPORTED_BROWSERS = ['Chrome 89+', 'Edge 89+', 'Brave', 'Opera']

const STEPS: Array<{ title: string; body: string }> = [
  {
    title: 'Plug your dash',
    body: 'USB-C cable, directly into your computer. No hub.',
  },
  {
    title: 'Pick the port',
    body: 'Click Connect device. Your browser asks which USB port to use.',
  },
  {
    title: 'Start tuning',
    body: 'Edit your dashboard live — your changes preview as you type.',
  },
]

export interface WelcomeScreenProps {
  supported?: boolean
  busy?: boolean
  reconnecting?: boolean
  lastError?: string | null
  onConnect?: () => void
  onExploreSimulation?: () => void
  footerLinks?: ReactNode
}

export const WelcomeScreen = ({
  supported = true,
  busy = false,
  reconnecting = false,
  lastError = null,
  onConnect,
  onExploreSimulation,
  footerLinks,
}: WelcomeScreenProps) => {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto bg-background px-8 py-12">
      <div className="flex w-full max-w-[540px] flex-col gap-7">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="flex justify-center text-text">
            <BrandLockup height={78} withBaseline label="CANShift Tuner" />
          </div>
          <h1 className="m-0 text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-text">
            Configure your dash, live.
          </h1>
          <p className="m-0 max-w-[440px] text-sm leading-[1.6] text-text-dim">
            Edit pages, bind CAN signals, tune OBD-II polling — all in your browser, with the dash
            connected over USB. No install, nothing to deploy.
          </p>
        </header>

        {!supported ? (
          <UnsupportedBrowserCard />
        ) : (
          <>
            <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
              {STEPS.map((step, idx) => (
                <li
                  key={step.title}
                  className="flex items-start gap-3.5 border border-border bg-surface px-4 py-3.5"
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center bg-brand-accent/15 text-[13px] font-bold text-brand-accent">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="mb-0.5 text-sm leading-[1.5] font-semibold text-text">
                      {step.title}
                    </div>
                    <div className="text-[13px] leading-[1.5] text-text-dim">{step.body}</div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                disabled={busy}
                onClick={onConnect}
                className="h-auto gap-0 px-7 py-3.5 text-[13px] leading-5 font-semibold uppercase tracking-[0.06em] disabled:opacity-70"
              >
                {busy ? (
                  <>
                    <Spinner /> {reconnecting ? 'Reconnecting…' : 'Connecting…'}
                  </>
                ) : (
                  'Connect device'
                )}
              </Button>
              {onExploreSimulation && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={onExploreSimulation}
                  className="h-auto gap-0 bg-transparent px-[22px] py-[13px] text-xs leading-5 font-medium tracking-[0.04em] text-text-dim disabled:opacity-60"
                >
                  Explore with sample data
                </Button>
              )}
            </div>

            {lastError ? (
              <div className="border border-destructive bg-bg-inset px-3.5 py-2.5 text-center text-[13px] text-destructive">
                {lastError}
              </div>
            ) : null}
          </>
        )}

        {footerLinks ? (
          <footer className="mt-2 flex items-center justify-center gap-2 border-t border-border pt-2">
            {footerLinks}
          </footer>
        ) : null}
      </div>
    </div>
  )
}

const UnsupportedBrowserCard = () => (
  <div
    className="border border-border bg-bg-inset px-5 py-[18px] text-left text-[13px] text-text-dim"
    role="alert"
  >
    <div className="mb-1.5 font-semibold text-text">
      WebSerial isn&apos;t available in this browser
    </div>
    <div className="mb-3 text-[13px]">
      CANShift Tuner needs the WebSerial API to talk to the dash over USB. Open this page in one of
      the supported browsers — or copy the URL and paste it into the new one:
    </div>
    <ul className="m-0 list-none p-0 text-[13px]">
      {SUPPORTED_BROWSERS.map((b) => (
        <li key={b} className="py-0.5">
          · {b}
        </li>
      ))}
    </ul>
  </div>
)
