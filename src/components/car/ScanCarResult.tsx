import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { useCarScanStore } from '../../stores/car-scan/car-scan.store'
import type { BusScanOutcome, BusScanResult } from '../../transport/bus-scan-wire'
import type { CarMatch } from '../../lib/car-scan/match-cars'
import { useCanSpeedDraft } from '../../hooks/useSettingsDraft'
import { parseCanSpeed } from '../../lib/can-speed'
import { CarMatchRow } from './CarMatchRow'

export interface ScanCarResultProps {
  onReview: (key: string) => void
}

const S = STRINGS.carScan

const UNDETECTED_TEXT: Record<Exclude<BusScanOutcome, 'detected'>, string> = {
  silent: S.silent,
  unclear: S.unclear,
  failed: S.failed,
}

const BusSummary = ({ result }: { result: BusScanResult }) => (
  <dl className="flex items-baseline justify-between gap-3 rounded-[12px] border border-app-border bg-app-bg p-3.5">
    <dt className="text-sm text-app-secondary">{S.busSpeedLabel}</dt>
    <dd className="flex flex-col items-end">
      <span className="font-mono text-[17px] tabular-nums">{S.busSpeed(result.kbps)}</span>
      <span className="text-xs text-app-muted">{S.frameIds(result.frames.length)}</span>
    </dd>
  </dl>
)

const SpeedButton = ({ kbps }: { kbps: number }) => {
  const speed = useCanSpeedDraft()
  const detected = parseCanSpeed(String(kbps))
  if (detected === null) return null
  if (speed.value === detected) return <p className="text-xs text-app-muted">{S.speedInUse}</p>
  return (
    <Button variant="outline" onClick={() => speed.set(detected)}>
      {S.applySpeed(kbps)}
    </Button>
  )
}

const Suggestions = ({
  matches,
  onReview,
}: { matches: readonly CarMatch[] } & ScanCarResultProps) => {
  if (matches.length === 0) return <p className="text-sm text-app-secondary">{S.noMatch}</p>
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-app-secondary">{S.suggestions}</h3>
      <ul className="flex flex-col gap-2">
        {matches.map((match) => (
          <CarMatchRow key={match.key} match={match} onReview={onReview} />
        ))}
      </ul>
    </section>
  )
}

const Detected = ({ result, onReview }: { result: BusScanResult } & ScanCarResultProps) => {
  const matches = useCarScanStore((s) => s.matches)
  return (
    <div className="flex flex-col gap-3">
      <BusSummary result={result} />
      {result.truncated && <p className="text-xs text-app-muted">{S.truncated}</p>}
      <Suggestions matches={matches} onReview={onReview} />
      <SpeedButton kbps={result.kbps} />
    </div>
  )
}

export const ScanCarResult = ({ onReview }: ScanCarResultProps) => {
  const result = useCarScanStore((s) => s.result)
  if (result === null) return null
  if (result.outcome === 'detected') return <Detected result={result} onReview={onReview} />
  return (
    <p className="text-sm leading-snug text-app-secondary">{UNDETECTED_TEXT[result.outcome]}</p>
  )
}
