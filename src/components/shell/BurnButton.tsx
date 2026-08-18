import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface BurnButtonProps {
  disabled?: boolean
  busy?: boolean
  title?: string
  label?: string
  onClick?: () => void
}

export const BurnButton = ({
  disabled = false,
  busy = false,
  title,
  label = 'BURN',
  onClick,
}: BurnButtonProps) => {
  const isDisabled = disabled && !busy
  return (
    <Button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      title={title}
      className={cn('h-auto gap-0 shell-burn-button', burnFace({ disabled: isDisabled }))}
    >
      {busy ? <Spinner size="sm" /> : null}
      {busy ? 'BURNING…' : label}
    </Button>
  )
}

export const BurnSuccessPill = () => (
  <span role="status" className={cn(OUTCOME_PILL, 'border-ui-ok text-ui-ok')}>
    Burned ✓
  </span>
)

const OUTCOME_PILL =
  'inline-flex max-w-[320px] items-center gap-1.5 border px-2 py-[3px] text-[11px] font-semibold'

const burnFace = cva('h-full border-none px-6 text-[12px] font-extrabold tracking-[0.09em]', {
  variants: {
    disabled: {
      true: 'cursor-not-allowed bg-transparent text-ui-faint',
      false: 'cursor-pointer bg-ui-accent text-white hover:bg-ui-accent-hover',
    },
  },
  defaultVariants: { disabled: false },
})
