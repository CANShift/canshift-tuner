import { InlineState } from '@/components/states/InlineState'
import { cn } from '@/lib/utils'

export interface LiveDataSkeletonProps {
  signalNames: readonly string[]
  className?: string | undefined
}

const ROW = 'flex w-full items-center gap-[14px]'
const LABEL_BLOCK = 'h-[11px] bg-brand-neutral-300'
const VALUE_BLOCK = 'h-[11px] flex-1 bg-brand-neutral-200'

const LABEL_WIDTH_STEPS = [
  { maxNameLength: 6, className: 'w-[64px]' },
  { maxNameLength: 12, className: 'w-[88px]' },
] as const

const LONGEST_LABEL_WIDTH = 'w-[104px]'

const labelWidthFor = (name: string): string =>
  LABEL_WIDTH_STEPS.find((step) => name.length <= step.maxNameLength)?.className ??
  LONGEST_LABEL_WIDTH

export const LiveDataSkeleton = ({ signalNames, className }: LiveDataSkeletonProps) => (
  <InlineState
    severity="empty"
    className={className}
    header={{ label: 'LIVE DATA', status: 'LISTENING…' }}
    footnote="Skeleton rows, no spinner. The row count is the profile's signal count, so the panel does not resize when data arrives."
  >
    {signalNames.map((name) => (
      <div key={name} className={ROW}>
        <div className={cn(LABEL_BLOCK, labelWidthFor(name))} />
        <div className={VALUE_BLOCK} />
      </div>
    ))}
  </InlineState>
)
