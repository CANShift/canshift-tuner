import { cn } from '@/lib/utils'

export interface ActiveBarProps {
  className?: string | undefined
}

export const ActiveBar = ({ className }: ActiveBarProps) => (
  <span
    aria-hidden="true"
    className={cn('absolute bottom-0 left-0 top-0 w-[3px] bg-brand-accent', className)}
  />
)
