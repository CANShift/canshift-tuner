import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type RoutePageProps = HTMLAttributes<HTMLDivElement>

export const RoutePage = ({ className, ...props }: RoutePageProps) => (
  <div className={cn('flex flex-1 flex-col overflow-hidden bg-ui-bg', className)} {...props} />
)

export type RouteBodyProps = HTMLAttributes<HTMLDivElement>

export const RouteBody = ({ className, ...props }: RouteBodyProps) => (
  <div className={cn('flex min-h-0 flex-1', className)} {...props} />
)

export type RoutePanelProps = HTMLAttributes<HTMLDivElement>

export const RoutePanel = ({ className, ...props }: RoutePanelProps) => (
  <div className={cn('flex min-h-0 flex-1 flex-col', className)} {...props} />
)
