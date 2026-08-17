import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const togglePillVariants = cva(
  [
    'cursor-pointer border px-3 py-[3px] text-[11px] font-semibold uppercase',
    'tracking-[0.04em] transition-colors active:brightness-95',
  ].join(' '),
  {
    variants: {
      tone: {
        accent: '',
        neutral: '',
        success: '',
        warning: '',
        danger: '',
        muted: '',
      },
      active: {
        true: 'bg-ui-panel',
        false: 'bg-transparent text-ui-muted',
      },
    },
    compoundVariants: [
      {
        tone: 'accent',
        active: true,
        class: 'border-ui-accent bg-ui-accent/15 text-ui-accent',
      },
      { tone: 'accent', active: false, class: 'border-ui-line-strong hover:border-ui-accent' },
      { tone: 'neutral', active: true, class: 'border-ui-ink text-ui-ink' },
      { tone: 'neutral', active: false, class: 'border-ui-line-strong hover:border-ui-ink' },
      { tone: 'success', active: true, class: 'border-ui-ok text-ui-ok' },
      { tone: 'success', active: false, class: 'border-ui-line-strong hover:border-ui-ok' },
      { tone: 'warning', active: true, class: 'border-ui-warning text-ui-warning' },
      { tone: 'warning', active: false, class: 'border-ui-line-strong hover:border-ui-warning' },
      { tone: 'danger', active: true, class: 'border-ui-danger text-ui-danger' },
      { tone: 'danger', active: false, class: 'border-ui-line-strong hover:border-ui-danger' },
      { tone: 'muted', active: true, class: 'border-ui-faint text-ui-faint' },
      { tone: 'muted', active: false, class: 'border-ui-line-strong hover:border-ui-faint' },
    ],
    defaultVariants: {
      tone: 'accent',
      active: false,
    },
  }
)

export type TogglePillTone = NonNullable<VariantProps<typeof togglePillVariants>['tone']>

interface TogglePillProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  tone?: TogglePillTone
}

export const TogglePill = ({ active, onClick, children, tone }: TogglePillProps) => (
  <button type="button" onClick={onClick} className={cn(togglePillVariants({ tone, active }))}>
    {children}
  </button>
)
