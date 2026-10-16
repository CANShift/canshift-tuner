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
        default: 'rounded-control bg-app-primary font-semibold text-white hover:brightness-110',
        destructive: 'rounded-control bg-app-primary font-semibold text-white hover:brightness-110',
        outline:
          'rounded-control border border-app-border bg-transparent text-app-text hover:bg-app-surface-2',
        secondary:
          'rounded-control border border-app-border bg-app-surface-2 text-app-text hover:brightness-110',
        ghost: 'rounded-control text-app-text hover:bg-app-surface-2',
        link: 'text-app-text underline-offset-4 hover:text-app-accent hover:underline',
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
