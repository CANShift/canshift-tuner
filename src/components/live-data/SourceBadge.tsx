import { cn } from '@/lib/utils'

export type SignalSource = 'live' | 'sim' | 'none'

interface SourceBadgeProps {
  source: SignalSource
}

const SOURCE_BADGE: Record<SignalSource, { label: string; tone: string }> = {
  live: { label: 'Live', tone: 'text-success' },
  sim: { label: 'Simulation', tone: 'text-accent' },
  none: { label: 'No data', tone: 'text-text-muted' },
}

export const SourceBadge = ({ source }: SourceBadgeProps) => {
  const badge = SOURCE_BADGE[source]
  return <span className={cn('font-semibold', badge.tone)}>{badge.label}</span>
}
