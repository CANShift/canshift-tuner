import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type SquareTone = 'default' | 'active' | 'danger'

export interface SquareButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: SquareTone
  children: ReactNode
}

const square = cva('grid size-[38px] place-items-center border bg-transparent', {
  variants: {
    tone: {
      default: 'border-ui-ink text-ui-ink',
      active: 'border-ui-accent text-ui-accent',
      danger: 'border-ui-accent text-ui-accent',
    },
    disabled: {
      true: 'cursor-not-allowed border-ui-line text-ui-faint',
      false: 'cursor-pointer hover:bg-ui-panel',
    },
  },
  defaultVariants: { tone: 'default', disabled: false },
})

export const SquareButton = ({
  label,
  onClick,
  disabled = false,
  tone = 'default',
  children,
}: SquareButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className={cn(square({ tone, disabled }))}
  >
    <svg viewBox="0 0 16 16" className="w-[13px]" fill="none" stroke="currentColor" strokeWidth={2}>
      {children}
    </svg>
  </button>
)
