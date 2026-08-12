import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: 'sm' | 'md'
}

const spinner = cva(
  [
    'inline-block rounded-[50%] align-[-2px]',
    'border-2 border-solid border-brand-ground border-t-transparent',
    '[animation:canshift-tuner-spin_700ms_linear_infinite]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'mr-[7px] h-2.5 w-2.5',
        md: 'mr-2 h-3 w-3',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export const Spinner = ({ size = 'md' }: SpinnerProps) => (
  <span aria-hidden="true" className={cn(spinner({ size }))} />
)
