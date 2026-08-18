import type { ComponentType, ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { BrandLockup } from '../brand/BrandLockup'
import type { RoutePath } from '../../constants/routes'

export type HeaderStatus =
  'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'simulation'

export interface HeaderTab {
  to: RoutePath
  label: string
  gated: boolean
}

export const HEADER_TABS: readonly HeaderTab[] = [
  { to: '/', label: 'HOME', gated: false },
  { to: '/dash', label: 'DASH', gated: true },
  { to: '/signals', label: 'SIGNALS', gated: true },
  { to: '/live', label: 'LIVE', gated: true },
  { to: '/device', label: 'DEVICE', gated: true },
]

export interface HeaderLinkProps {
  to: string
  className: string
  children: ReactNode
  'aria-current'?: 'page' | undefined
}

interface StatusVisual {
  label: string
  tint: string
}

const STATUS_VISUAL: Record<HeaderStatus, StatusVisual> = {
  connected: { label: 'CONNECTED', tint: 'text-ui-ok' },
  connecting: { label: 'CONNECTING', tint: 'text-ui-accent' },
  reconnecting: { label: 'RECONNECTING', tint: 'text-ui-accent' },
  simulation: { label: 'SIMULATION', tint: 'text-ui-accent' },
  disconnected: { label: 'NO DEVICE', tint: 'text-ui-header-dim' },
}

export interface HeaderViewProps {
  activePath: string
  gatingActive: boolean
  status: HeaderStatus
  configNameField: ReactNode
  onDisconnect?: (() => void) | undefined
  themeToggle: ReactNode
  saveButton: ReactNode
  burnButton: ReactNode
  LinkComponent: ComponentType<HeaderLinkProps>
}

export const HeaderView = ({
  activePath,
  gatingActive,
  status,
  configNameField,
  onDisconnect,
  themeToggle,
  saveButton,
  burnButton,
  LinkComponent,
}: HeaderViewProps) => {
  const visual = STATUS_VISUAL[status]
  return (
    <header className="flex h-[52px] shrink-0 items-stretch bg-ui-header-bg text-ui-header-ink">
      <div className="flex items-center gap-2.5 px-5">
        <BrandLockup height={19} />
        <span className="hidden font-mono text-[11px] tracking-[0.16em] text-ui-faint min-[1000px]:inline">
          TUNER
        </span>
      </div>

      {configNameField}

      <nav aria-label="Primary" className="ml-[18px] flex items-stretch">
        {HEADER_TABS.map((tab) => (
          <HeaderTabItem
            key={tab.to}
            tab={tab}
            active={activePath === tab.to}
            disabled={tab.gated && gatingActive}
            LinkComponent={LinkComponent}
          />
        ))}
      </nav>

      <div className="flex-1" />

      <div
        className={cn(
          'hidden items-center gap-[9px] whitespace-nowrap px-[18px] font-mono text-[11.5px] tracking-[0.08em] min-[1060px]:flex',
          visual.tint
        )}
      >
        <span aria-hidden="true" className="block size-[7px] bg-current" />
        <span role="status" aria-live="polite">
          {visual.label}
        </span>
      </div>

      {themeToggle}

      {onDisconnect && (
        <button
          type="button"
          onClick={onDisconnect}
          title="Disconnect the dash"
          className="cursor-pointer whitespace-nowrap border-0 border-l border-solid border-ui-header-line bg-transparent px-4 font-mono text-[11px] tracking-[0.14em] text-ui-faint hover:text-ui-engaged"
        >
          DISCONNECT
        </button>
      )}

      {saveButton}
      {burnButton}
    </header>
  )
}

interface HeaderTabItemProps {
  tab: HeaderTab
  active: boolean
  disabled: boolean
  LinkComponent: ComponentType<HeaderLinkProps>
}

const HeaderTabItem = ({ tab, active, disabled, LinkComponent }: HeaderTabItemProps) => {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="Connect a dash, or edit offline, to open this tab"
        className={cn(headerTab({ state: 'disabled' }))}
      >
        {tab.label}
      </span>
    )
  }
  return (
    <LinkComponent
      to={tab.to}
      className={cn(headerTab({ state: active ? 'active' : 'idle' }))}
      {...(active ? { 'aria-current': 'page' } : {})}
    >
      {tab.label}
    </LinkComponent>
  )
}

const headerTab = cva(
  [
    'flex items-center whitespace-nowrap px-4 text-[13px] font-bold tracking-[0.06em]',
    'no-underline outline-offset-[-2px]',
  ].join(' '),
  {
    variants: {
      state: {
        idle: 'cursor-pointer text-ui-header-dim hover:bg-ui-panel hover:text-ui-ink',
        active: 'cursor-pointer bg-ui-rule text-ui-bg',
        disabled: 'cursor-not-allowed text-ui-header-line',
      },
    },
    defaultVariants: { state: 'idle' },
  }
)
