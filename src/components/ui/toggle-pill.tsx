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
        true: 'bg-surface',
        false: 'bg-transparent text-text-dim',
      },
    },
    compoundVariants: [
      {
        tone: 'accent',
        active: true,
        class: 'border-brand-accent bg-brand-accent/15 text-brand-accent',
      },
      { tone: 'accent', active: false, class: 'border-border hover:border-brand-accent' },
      { tone: 'neutral', active: true, class: 'border-brand-neutral-700 text-brand-neutral-700' },
      { tone: 'neutral', active: false, class: 'border-border hover:border-brand-neutral-700' },
      { tone: 'success', active: true, class: 'border-success text-success' },
      { tone: 'success', active: false, class: 'border-border hover:border-success' },
      { tone: 'warning', active: true, class: 'border-warning text-warning' },
      { tone: 'warning', active: false, class: 'border-border hover:border-warning' },
      { tone: 'danger', active: true, class: 'border-status-danger text-status-danger' },
      { tone: 'danger', active: false, class: 'border-border hover:border-status-danger' },
      { tone: 'muted', active: true, class: 'border-brand-neutral-500 text-brand-neutral-500' },
      { tone: 'muted', active: false, class: 'border-border hover:border-brand-neutral-500' },
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
