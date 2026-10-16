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
        default: 'rounded-control bg-ui-primary font-semibold text-white hover:brightness-110',
        destructive: 'rounded-control bg-ui-primary font-semibold text-white hover:brightness-110',
        outline:
          'rounded-control border border-ui-border bg-transparent text-ui-text hover:bg-ui-surface-2',
        secondary:
          'rounded-control border border-ui-border bg-ui-surface-2 text-ui-text hover:brightness-110',
        ghost: 'rounded-control text-ui-text hover:bg-ui-surface-2',
        link: 'text-ui-text underline-offset-4 hover:text-ui-accent hover:underline',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 px-3',
        lg: 'h-[52px] px-6 text-[15px]',
        icon: 'size-11',
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
