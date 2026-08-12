import type { ComponentType, ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ActiveBar } from '../ui/active-bar'
import { MetaText } from '../ui/meta-text'
import { CollapseButton } from './CollapseRail'

export type SidebarRoute =
  | '/'
  | '/dashboard'
  | '/can'
  | '/ecu'
  | '/obd2'
  | '/themes'
  | '/live'
  | '/logs'
  | '/cli'
  | '/board'
  | '/firmware'
  | '/about'

interface NavItem {
  to: SidebarRoute
  label: string
  alwaysOn?: boolean
}

interface NavGroup {
  label: string | null
  items: readonly NavItem[]
}

export const SIDEBAR_GROUPS: readonly NavGroup[] = [
  { label: null, items: [{ to: '/', label: 'Welcome', alwaysOn: true }] },
  {
    label: 'DASHBOARD',
    items: [
      { to: '/dashboard', label: 'Pages & widgets' },
      { to: '/themes', label: 'Themes' },
    ],
  },
  {
    label: 'VEHICLE',
    items: [
      { to: '/can', label: 'CAN bus' },
      { to: '/ecu', label: 'ECU profile' },
      { to: '/obd2', label: 'OBD-II' },
    ],
  },
  {
    label: 'DIAGNOSTICS',
    items: [
      { to: '/live', label: 'Live data' },
      { to: '/logs', label: 'Logs' },
      { to: '/cli', label: 'CLI' },
    ],
  },
  {
    label: 'DEVICE',
    items: [
      { to: '/board', label: 'Board config' },
      { to: '/firmware', label: 'Firmware' },
      { to: '/about', label: 'About' },
    ],
  },
]

export interface SidebarLinkProps {
  to: string
  className: string
  children: ReactNode
  title?: string
}

export interface SidebarViewProps {
  activeRoute: string
  offline: boolean
  targetLabel: string | null
  firmwareVersion: string | null
  LinkComponent?: ComponentType<SidebarLinkProps>
  onCollapse?: () => void
}

const DefaultLink: ComponentType<SidebarLinkProps> = ({ to, className, children, title }) => (
  <a href={to} className={className} title={title}>
    {children}
  </a>
)

export const SidebarView = ({
  activeRoute,
  offline,
  targetLabel,
  firmwareVersion,
  LinkComponent = DefaultLink,
  onCollapse,
}: SidebarViewProps) => (
  <nav
    aria-label="Primary"
    className="flex w-[236px] shrink-0 flex-col border-r-2 border-brand-divider bg-brand-neutral-100"
  >
    {onCollapse && (
      <div className="flex justify-end px-2 pt-2">
        <CollapseButton side="left" label="Menu" onCollapse={onCollapse} />
      </div>
    )}
    <div className="flex-1 overflow-y-auto py-4">
      {SIDEBAR_GROUPS.map((group, groupIdx) => (
        <div key={group.label ?? 'top'}>
          {group.label !== null && (
            <div className={cn(GROUP_LABEL, groupIdx === 1 && 'pt-[14px]')}>{group.label}</div>
          )}
          {group.items.map((item) => (
            <SidebarItem
              key={item.to}
              item={item}
              active={activeRoute === item.to}
              disabled={offline && item.alwaysOn !== true}
              LinkComponent={LinkComponent}
            />
          ))}
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-2.5 border-t-2 border-brand-divider px-[18px] py-3.5">
      <MetaText className="flex justify-between">
        <span>TARGET</span>
        <span className="text-brand-text">{targetLabel ?? '—'}</span>
      </MetaText>
      <MetaText className="flex justify-between">
        <span>FIRMWARE</span>
        <span className="text-brand-text">
          {firmwareVersion !== null ? `v${firmwareVersion}` : '—'}
        </span>
      </MetaText>
    </div>
  </nav>
)

interface SidebarItemProps {
  item: NavItem
  active: boolean
  disabled: boolean
  LinkComponent: ComponentType<SidebarLinkProps>
}

const SidebarItem = ({ item, active, disabled, LinkComponent }: SidebarItemProps) => {
  if (disabled) {
    return (
      <div
        role="link"
        tabIndex={0}
        aria-disabled="true"
        aria-label={`${item.label} — connect a device to access this section`}
        title="Connect a device to access this section"
        className={cn(navItem({ state: 'disabled' }))}
      >
        {item.label}
      </div>
    )
  }
  return (
    <LinkComponent
      to={item.to}
      className={cn(navItem({ state: active ? 'active' : 'default' }), !active && 'shell-nav-item')}
    >
      {active && <ActiveBar />}
      {item.label}
    </LinkComponent>
  )
}

const GROUP_LABEL =
  'px-[18px] pb-2 pt-[22px] text-[9px] font-extrabold tracking-[0.22em] text-brand-neutral-600'

const navItem = cva(
  'relative flex w-full items-center py-[9px] pl-[21px] pr-[18px] text-[13px] no-underline',
  {
    variants: {
      state: {
        default: 'text-brand-neutral-700',
        active: 'bg-brand-neutral-200 font-extrabold text-brand-text',
        disabled: 'cursor-not-allowed text-brand-neutral-500',
      },
    },
    defaultVariants: { state: 'default' },
  }
)
