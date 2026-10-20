import { cva } from 'class-variance-authority'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { STRINGS } from '../../strings'
import type { CarMatch, MatchConfidence } from '../../lib/car-scan/match-cars'

export interface CarMatchRowProps {
  match: CarMatch
  onReview: (key: string) => void
}

const S = STRINGS.carScan

const CONFIDENCE_LABEL: Record<MatchConfidence, string> = {
  strong: S.strong,
  possible: S.possible,
}

const confidenceChip = cva('rounded-control px-2 py-0.5 text-[11px] font-semibold', {
  variants: {
    confidence: {
      strong: 'bg-app-primary/15 text-app-primary',
      possible: 'bg-app-surface-2 text-app-secondary',
    },
  },
})

export const CarMatchRow = ({ match, onReview }: CarMatchRowProps) => (
  <li className="flex items-center gap-3 rounded-[12px] border border-app-border px-3.5 py-2.5">
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="truncate text-[15px]">{match.label}</span>
      <span className="flex flex-wrap items-center gap-2 text-xs text-app-muted">
        <span className={cn(confidenceChip({ confidence: match.confidence }))}>
          {CONFIDENCE_LABEL[match.confidence]}
        </span>
        {S.framesSeen(match.matched, match.total)}
      </span>
    </div>
    <Button variant="secondary" size="sm" onClick={() => onReview(match.key)}>
      {S.review}
    </Button>
  </li>
)
