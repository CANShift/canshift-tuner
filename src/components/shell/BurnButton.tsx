import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface BurnButtonProps {
  disabled?: boolean
  busy?: boolean
  title?: string
  onClick?: () => void
}

export const BurnButton = ({ disabled = false, busy = false, title, onClick }: BurnButtonProps) => {
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
      {busy ? 'BURNING…' : 'BURN TO DEVICE'}
    </Button>
  )
}

export interface BurnOutcomePillProps {
  kind: 'success' | 'error'
  message?: string
  onDismiss?: () => void
}

export const BurnOutcomePill = ({ kind, message, onDismiss }: BurnOutcomePillProps) => {
  if (kind === 'success') {
    return (
      <span
        role="status"
        className={cn(OUTCOME_PILL, 'border-success bg-success/[0.12] text-success')}
      >
        Burned ✓
      </span>
    )
  }
  return (
    <span
      role="alert"
      title={message}
      className={cn(OUTCOME_PILL, 'border-destructive bg-destructive/10 text-destructive')}
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{message}</span>
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss burn error"
          onClick={onDismiss}
          className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-[10px] leading-none text-inherit"
        >
          ✕
        </button>
      ) : null}
    </span>
  )
}

const OUTCOME_PILL =
  'inline-flex max-w-[320px] items-center gap-1.5 border px-2 py-[3px] text-[11px] font-semibold'

const burnFace = cva('h-full border-none px-6 text-[12px] font-extrabold tracking-[0.09em]', {
  variants: {
    disabled: {
      true: 'cursor-not-allowed bg-brand-neutral-200 text-brand-neutral-500',
      false: 'cursor-pointer bg-brand-accent text-white',
    },
  },
  defaultVariants: { disabled: false },
})
