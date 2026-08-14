import { InlineStateHeaderRow } from '@/components/states/InlineState'
import { cn } from '@/lib/utils'
import { LIVE_DATA_CELL, LIVE_DATA_GRID } from './grid-shape'

export interface LiveDataSkeletonProps {
  signalNames: readonly string[]
  className?: string | undefined
}

const PANEL = 'flex min-h-0 flex-1 flex-col'
const LABEL_BLOCK = 'h-[11px] bg-brand-neutral-300'
const VALUE_BLOCK = 'h-[48px] w-full bg-brand-neutral-200'

const LABEL_WIDTH_STEPS = [
  { maxNameLength: 6, className: 'w-[64px]' },
  { maxNameLength: 12, className: 'w-[88px]' },
] as const

const LONGEST_LABEL_WIDTH = 'w-[104px]'

const labelWidthFor = (name: string): string =>
  LABEL_WIDTH_STEPS.find((step) => name.length <= step.maxNameLength)?.className ??
  LONGEST_LABEL_WIDTH

export const LiveDataSkeleton = ({ signalNames, className }: LiveDataSkeletonProps) => (
  <div role="status" className={cn(PANEL, className)}>
    <InlineStateHeaderRow header={{ label: 'LIVE DATA', status: 'LISTENING…' }} />
    <div className={LIVE_DATA_GRID}>
      {signalNames.map((name) => (
        <div key={name} className={LIVE_DATA_CELL}>
          <div className={cn(LABEL_BLOCK, labelWidthFor(name))} />
          <div className={VALUE_BLOCK} />
        </div>
      ))}
    </div>
  </div>
)
