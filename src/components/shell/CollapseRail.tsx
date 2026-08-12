import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

type Side = 'left' | 'right'

const Chevron = ({ dir }: { dir: Side }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={cn(dir === 'left' && 'rotate-180')}
  >
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

interface CollapseRailProps {
  side: Side
  label: string
  onExpand: () => void
}

export const CollapseRail = ({ side, label, onExpand }: CollapseRailProps) => (
  <div className={cn(rail({ side }))}>
    <button
      type="button"
      onClick={onExpand}
      title={`Expand ${label}`}
      aria-label={`Expand ${label}`}
      className={cn('shell-nav-item', RAIL_ICON_BUTTON, 'size-6')}
    >
      <Chevron dir={side === 'left' ? 'right' : 'left'} />
    </button>
    <span className="rotate-180 select-none text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-neutral-600 [writing-mode:vertical-rl]">
      {label}
    </span>
  </div>
)

interface CollapseButtonProps {
  side: Side
  label: string
  onCollapse: () => void
}

export const CollapseButton = ({ side, label, onCollapse }: CollapseButtonProps) => (
  <button
    type="button"
    onClick={onCollapse}
    title={`Collapse ${label}`}
    aria-label={`Collapse ${label}`}
    className={cn('shell-nav-item', RAIL_ICON_BUTTON, 'size-[26px] shrink-0')}
  >
    <Chevron dir={side === 'left' ? 'left' : 'right'} />
  </button>
)

const RAIL_ICON_BUTTON =
  'flex cursor-pointer items-center justify-center border-0 bg-transparent text-brand-neutral-600'

const rail = cva('flex w-[30px] shrink-0 flex-col items-center gap-3 bg-brand-neutral-100 pt-2.5', {
  variants: {
    side: {
      left: 'border-r-2 border-brand-divider',
      right: 'border-l-2 border-brand-divider',
    },
  },
})
