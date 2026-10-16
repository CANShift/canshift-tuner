import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSendButton } from '../../hooks/useSendButton'

export interface SendButtonProps {
  className?: string
}

export const SendButton = ({ className }: SendButtonProps) => {
  const { label, disabled, busy, send } = useSendButton()
  return (
    <Button
      aria-busy={busy}
      disabled={disabled}
      onClick={send}
      className={cn(
        'px-5 text-[15px] disabled:bg-app-surface-2 disabled:text-[#8a9097] disabled:opacity-100',
        className
      )}
    >
      {label}
    </Button>
  )
}
