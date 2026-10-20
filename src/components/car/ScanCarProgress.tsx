import { ProgressBar } from '@/components/ui/progress-bar'
import { STRINGS } from '../../strings'
import { useCarScanStore, type ScanProgress } from '../../stores/car-scan/car-scan.store'

const S = STRINGS.carScan

const PERCENT = 100

const progressLabel = (progress: ScanProgress | null, matching: boolean): string => {
  if (matching) return S.matching
  if (progress === null) return S.starting
  return progress.listening ? S.listeningAt(progress.kbps) : S.readingAt(progress.kbps)
}

const percentOf = (progress: ScanProgress | null, matching: boolean): number => {
  if (matching) return PERCENT
  if (progress === null || progress.steps === 0) return 0
  return Math.round(((progress.step - 1) / progress.steps) * PERCENT)
}

export const ScanCarProgress = () => {
  const progress = useCarScanStore((s) => s.progress)
  const matching = useCarScanStore((s) => s.phase === 'matching')
  const percent = percentOf(progress, matching)
  const label = progressLabel(progress, matching)
  return (
    <div className="flex flex-col gap-2.5" aria-live="polite">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px]">{label}</span>
        {progress !== null && !matching && (
          <span className="text-xs tabular-nums text-app-muted">
            {S.step(progress.step, progress.steps)}
          </span>
        )}
      </div>
      <ProgressBar percent={percent} label={label} />
    </div>
  )
}
