import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-11 w-full rounded-control border border-ui-border bg-ui-bg px-3 text-[15px] text-ui-text transition-colors',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ui-ink',
      'placeholder:text-ui-muted hover:border-ui-muted focus:border-ui-text',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-ui-border',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
