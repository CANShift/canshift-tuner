import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'text-sm font-medium transition-colors active:brightness-95',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-ui-accent text-white hover:bg-ui-accent-hover',
        destructive: 'bg-ui-danger text-white hover:brightness-95',
        outline: 'border border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel',
        secondary: 'bg-ui-panel text-ui-ink hover:brightness-95',
        ghost: 'text-ui-ink hover:bg-ui-panel',
        link: 'text-ui-ink underline-offset-4 hover:text-ui-accent hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
