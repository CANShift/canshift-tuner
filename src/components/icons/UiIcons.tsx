import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const ICONS = {
  check: <path d="M5 12l5 5L20 7" />,
  gauges: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  car: (
    <>
      <path d="M3 13l2-6h14l2 6v5H3z" />
      <circle cx="7.5" cy="15.5" r="1.5" />
      <circle cx="16.5" cy="15.5" r="1.5" />
    </>
  ),
  dash: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M8 15a4 4 0 0 1 8 0" />
      <path d="M12 15l2-3" />
    </>
  ),
  refresh: <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" />,
  wifiOff: (
    <>
      <path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19.5" r="1" />
      <path d="M3 3l18 18" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5M12 18v.5" />
    </>
  ),
  fullScreen: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17v.5" />
    </>
  ),
  file: (
    <>
      <path d="M6 2h8l5 5v15H6z" />
      <path d="M14 2v5h5" />
    </>
  ),
  chip: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
  clock: <path d="M12 6v6l4 2" />,
  download: <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />,
  move: <path d="M8 7l-4 5 4 5M16 7l4 5-4 5M4 12h16" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
} satisfies Record<string, ReactNode>

export type UiIconName = keyof typeof ICONS

export interface UiIconProps {
  name: UiIconName
  className?: string
}

export const UiIcon = ({ name, className }: UiIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={cn('size-5 shrink-0', className)}
  >
    {ICONS[name]}
  </svg>
)
