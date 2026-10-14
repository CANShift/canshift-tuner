import { ThemeToggleButton } from './ThemeToggleButton'
import { useThemeStore } from '../../stores/theme.store'
import type { CapabilityReason } from '../../lib/capability'

const HEADLINE: Record<CapabilityReason, string> = {
  narrow: 'The Tuner needs a wider window.',
  'no-web-serial': 'This browser cannot talk to a dash.',
}

const BODY: Record<CapabilityReason, string> = {
  narrow:
    'Editing a dash means dragging widgets on a 320×240 canvas next to a signal table, and that does not survive a phone-sized window. Open the Tuner on a computer, in a window at least 900 px wide.',
  'no-web-serial':
    'The Tuner writes config over WebSerial, which this browser does not implement. Safari and Firefox have never shipped it, and no iOS or Android browser can.',
}

const BROWSERS = 'Chrome 89+ · Edge 89+ · Brave · Opera — on macOS, Windows or Linux'

export interface CapabilityScreenProps {
  reason: CapabilityReason
}

export const CapabilityScreen = ({ reason }: CapabilityScreenProps) => {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

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

      <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-16 pt-10">
        <h1 className="mb-4 text-[27px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ui-ink">
          {HEADLINE[reason]}
        </h1>
        <p className="mb-6 text-pretty text-[15px] leading-[1.6] text-ui-muted">{BODY[reason]}</p>
        <p className="border-l-[3px] border-l-ui-accent py-1 pl-3.5 font-mono text-[12.5px] leading-[1.6] text-ui-ink">
          {BROWSERS}
        </p>
      </main>
    </div>
  )
}
