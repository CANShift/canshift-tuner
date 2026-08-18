import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ThemeToggleButton } from './ThemeToggleButton'
import { useThemeStore } from '../../stores/theme.store'
import { useFirmwareReleases } from '../../hooks/useFirmwareReleases'
import { parseChangelog } from '../../lib/firmware/changelog'
import { ChangelogPanel } from '../firmware/ChangelogPanel'
import { RouteLoading } from './RouteLoading'
import type { CapabilityReason } from '../../lib/capability'

const ContactRoute = lazy(() => import('../../routes/ContactRoute'))

type Pane = 'why' | 'changelog' | 'contact'

const PANE_LABELS: Record<Pane, string> = {
  why: 'Why',
  changelog: 'Firmware',
  contact: 'Contact',
}

const PANES = Object.keys(PANE_LABELS) as Pane[]

const HEADLINE: Record<CapabilityReason, string> = {
  narrow: 'The Tuner needs a wider window.',
  'no-web-serial': 'This browser cannot talk to a dash.',
}

const BODY: Record<CapabilityReason, string> = {
  narrow:
    'Editing a dash means dragging widgets on a 320×240 canvas next to a signal table, and that does not survive a phone-sized window. Open the Tuner on a computer, in a window at least 900 px wide.',
  'no-web-serial':
    'The Tuner writes firmware and config over WebSerial, which this browser does not implement. Safari and Firefox have never shipped it, and no iOS or Android browser can.',
}

const BROWSERS = 'Chrome 89+ · Edge 89+ · Brave · Opera — on macOS, Windows or Linux'

const STILL_WORKS = 'Two things still work here: the firmware changelog, and telling us something.'

export interface CapabilityScreenProps {
  reason: CapabilityReason
}

export const CapabilityScreen = ({ reason }: CapabilityScreenProps) => {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const { state } = useFirmwareReleases()
  const [pane, setPane] = useState<Pane>('why')

  const release = state.kind === 'ok' ? (state.releases[0] ?? null) : null
  const entries = useMemo(() => parseChangelog(release?.notes ?? ''), [release?.notes])

  const PANES_BY_KEY: Record<Pane, ReactNode> = {
    why: (
      <div className="px-6 pb-16 pt-10">
        <h1 className="mb-4 text-[27px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ui-ink">
          {HEADLINE[reason]}
        </h1>
        <p className="mb-6 text-pretty text-[15px] leading-[1.6] text-ui-muted">{BODY[reason]}</p>
        <p className="mb-7 border-l-[3px] border-l-ui-accent py-1 pl-3.5 font-mono text-[12.5px] leading-[1.6] text-ui-ink">
          {BROWSERS}
        </p>
        <p className="text-[14px] leading-[1.6] text-ui-muted">{STILL_WORKS}</p>
      </div>
    ),
    changelog: (
      <div className="px-6 pb-16 pt-10">
        {release === null ? (
          <p className="text-[14px] text-ui-muted">Fetching the firmware releases…</p>
        ) : (
          <ChangelogPanel
            version={release.version}
            publishedAt={release.publishedAt}
            notesUrl={release.htmlUrl}
            entries={entries}
          />
        )}
      </div>
    ),
    contact: (
      <Suspense fallback={<RouteLoading />}>
        <ContactRoute />
      </Suspense>
    ),
  }

  return (
    <div className="flex min-h-screen flex-col bg-ui-bg font-sans text-ui-ink">
      <header className="flex h-[52px] shrink-0 items-center gap-3 bg-ui-header-bg pl-4">
        <span className="font-mono text-[12px] font-bold tracking-[0.14em] text-ui-header-ink">
          CANSHIFT
        </span>
        <span className="font-mono text-[11px] tracking-[0.14em] text-ui-header-dim">TUNER</span>
        <span className="ml-auto flex h-full items-center">
          <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
        </span>
      </header>

      <nav
        aria-label="Sections"
        className="flex shrink-0 gap-px border-b-2 border-ui-rule px-4 py-3"
      >
        {PANES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setPane(value)
            }}
            className={cn(tab({ active: value === pane }))}
          >
            {PANE_LABELS[value]}
          </button>
        ))}
      </nav>

      <main className="min-h-0 flex-1 overflow-y-auto">{PANES_BY_KEY[pane]}</main>
    </div>
  )
}

const tab = cva(
  'cursor-pointer whitespace-nowrap border px-4 py-2 text-[12.5px] font-bold tracking-[0.06em]',
  {
    variants: {
      active: {
        true: 'border-ui-rule bg-ui-rule text-ui-bg',
        false: 'border-ui-ink bg-transparent text-ui-ink',
      },
    },
    defaultVariants: { active: false },
  }
)
