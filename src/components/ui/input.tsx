import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-10 w-full border border-ui-line-strong bg-transparent px-3 py-2 text-sm text-ui-ink transition-colors',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ui-ink',
      'placeholder:text-ui-faint hover:border-ui-ink focus:border-ui-ink',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-ui-line-strong',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
