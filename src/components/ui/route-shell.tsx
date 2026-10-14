import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type RoutePageProps = HTMLAttributes<HTMLDivElement>

export const RoutePage = ({ className, ...props }: RoutePageProps) => (
  <div className={cn('flex flex-1 flex-col overflow-hidden bg-ui-bg', className)} {...props} />
)
