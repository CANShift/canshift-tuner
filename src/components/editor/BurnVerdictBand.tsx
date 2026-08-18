import { useMemo } from 'react'
import { useDashboardStore } from '../../stores/dashboard.store'
import { configVerdict, type ConfigVerdict } from '../../lib/burn-verdict'

const MESSAGES: Record<ConfigVerdict['kind'], (verdict: ConfigVerdict) => string> = {
  ok: () => '',
  'out-of-bounds': () => 'A widget sits past the panel — the dash would clip it.',
  unbound: (verdict) =>
    verdict.kind === 'unbound'
      ? `${String(verdict.count)} widget${verdict.count === 1 ? '' : 's'} bound to nothing — ${verdict.count === 1 ? 'it' : 'they'} would render blank on the dash.`
      : '',
}

const KICKERS: Record<ConfigVerdict['kind'], string> = {
  ok: '',
  'out-of-bounds': 'OUT OF BOUNDS',
  unbound: 'UNBOUND',
}

export const BurnVerdictBand = () => {
  const config = useDashboardStore((s) => s.config)
  const verdict = useMemo(() => configVerdict(config), [config])
  if (verdict.kind === 'ok') return null
  const message = MESSAGES[verdict.kind]
  const kicker = KICKERS[verdict.kind]

  return (
    <div className="flex shrink-0 items-center gap-3.5 border-t-2 border-ui-warning bg-ui-panel px-6 py-2.5">
      <span className="whitespace-nowrap font-mono text-[10.5px] tracking-[0.16em] text-ui-warning">
        {kicker}
      </span>
      <span className="font-mono text-[12.5px] text-ui-ink">{message(verdict)}</span>
    </div>
  )
}
