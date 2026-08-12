import type { ReactNode } from 'react'
import { AutosavePill } from './AutosavePill'
import { BrandLockup } from '../brand/BrandLockup'
import { cn } from '@/lib/utils'

export type HeaderStatus =
  'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'simulation'

export interface HeaderViewProps {
  tunerVersion: string
  status: HeaderStatus
  projectName?: string | null
  lastSavedAt?: number | null
  portLabel?: string | null
  activityPulse?: boolean
  projectSwitcher?: ReactNode
  firmwareSlot?: ReactNode
  themeToggle?: ReactNode
  burnButton?: ReactNode
  onDisconnect?: () => void
}

interface StatusVisual {
  label: string
  tone: string
  dot: string
}

const ACCENT_VISUAL = { tone: 'border-brand-accent text-brand-accent', dot: 'bg-brand-accent' }

const STATUS_VISUAL: Record<HeaderStatus, StatusVisual> = {
  connected: { label: 'CONNECTED', tone: 'border-success text-success', dot: 'bg-success' },
  connecting: { label: 'CONNECTING…', ...ACCENT_VISUAL },
  reconnecting: { label: 'RECONNECTING…', ...ACCENT_VISUAL },
  simulation: { label: 'SIMULATION', ...ACCENT_VISUAL },
  disconnected: {
    label: 'NO DEVICE',
    tone: 'border-brand-neutral-500 text-brand-neutral-500',
    dot: 'bg-brand-neutral-500',
  },
}

const DISCONNECTED_VISUAL = STATUS_VISUAL.disconnected

export const HeaderView = ({
  tunerVersion,
  status,
  projectName = null,
  lastSavedAt = null,
  portLabel,
  activityPulse = false,
  projectSwitcher,
  firmwareSlot,
  themeToggle,
  burnButton,
  onDisconnect,
}: HeaderViewProps) => {
  const visual = STATUS_VISUAL[status] ?? DISCONNECTED_VISUAL
  return (
    <header className="flex h-14 shrink-0 items-stretch border-b-2 border-brand-divider bg-brand-chrome-bg">
      <div className="flex items-center gap-[11px] border-r-2 border-brand-divider pl-[18px] pr-5 text-brand-text">
        <BrandLockup height={24} />
        <span className="self-end pb-2.5 text-[9px] font-semibold tracking-[0.2em] text-brand-neutral-600">
          TUNER
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3.5 px-5">
        {projectSwitcher ??
          (projectName !== null && (
            <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-extrabold text-brand-text">
              {projectName}
            </span>
          ))}
        <AutosavePill lastSavedAt={lastSavedAt} />
        <span className={cn(STATUS_PILL, visual.tone)}>
          <span
            aria-hidden="true"
            className={cn(
              'size-[7px] [transition:opacity_80ms_ease-out]',
              visual.dot,
              activityPulse ? 'opacity-45' : 'opacity-100'
            )}
          />
          <span role="status" aria-live="polite">
            {visual.label}
          </span>
          {onDisconnect && (status === 'connected' || status === 'simulation') ? (
            <button
              type="button"
              onClick={onDisconnect}
              title="Disconnect from dash"
              aria-label="Disconnect"
              className="cursor-pointer border-none bg-transparent p-0 text-[10px] leading-none text-current"
            >
              ✕
            </button>
          ) : null}
        </span>
        <span className={cn(META_SLOT)}>
          {portLabel !== null && portLabel !== undefined && <span>{portLabel} · </span>}
          {firmwareSlot}
        </span>
        <span className={cn(META_SLOT, 'ml-auto')}>tuner v{tunerVersion}</span>
      </div>

      <div className="flex items-stretch border-l-2 border-brand-divider">
        {themeToggle}
        {burnButton}
      </div>
    </header>
  )
}

const STATUS_PILL =
  'flex shrink-0 items-center gap-2 whitespace-nowrap border px-2.5 py-1 text-[11px] font-extrabold tracking-[0.09em]'

const META_SLOT = 'shrink-0 whitespace-nowrap font-mono text-[11px] text-brand-neutral-600'
