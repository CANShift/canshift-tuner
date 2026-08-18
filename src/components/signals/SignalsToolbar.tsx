import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type SignalSource = 'can' | 'obd2'

export interface SignalsToolbarProps {
  source: SignalSource
  onSource: (source: SignalSource) => void
  profiles: readonly { key: string; label: string }[]
  profileKey: string
  onProfile: (key: string) => void
  meta: string
  filter: string
  onFilter: (filter: string) => void
  actions: ReactNode
}

const SOURCE_LABELS: Record<SignalSource, string> = { can: 'CAN', obd2: 'OBD-II' }
const SOURCES = Object.keys(SOURCE_LABELS) as SignalSource[]

export const SignalsToolbar = ({
  source,
  onSource,
  profiles,
  profileKey,
  onProfile,
  meta,
  filter,
  onFilter,
  actions,
}: SignalsToolbarProps) => (
  <div className="flex h-[54px] shrink-0 items-center gap-4 border-b-2 border-ui-rule px-6">
    <div className="flex gap-px">
      {SOURCES.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            onSource(value)
          }}
          className={cn(segment({ active: value === source }))}
        >
          {SOURCE_LABELS[value]}
        </button>
      ))}
    </div>

    <select
      value={profileKey}
      onChange={(e) => {
        onProfile(e.target.value)
      }}
      aria-label="ECU profile"
      className="max-w-[220px] border border-ui-ink bg-ui-bg py-2 pl-2.5 pr-[26px] font-mono text-[13px] font-bold text-ui-ink"
    >
      {profiles.map((profile) => (
        <option key={profile.key} value={profile.key}>
          {profile.label}
        </option>
      ))}
    </select>

    <span className="hidden whitespace-nowrap font-mono text-[11.5px] text-ui-muted min-[1240px]:inline">
      {meta}
    </span>

    <input
      value={filter}
      onChange={(e) => {
        onFilter(e.target.value)
      }}
      placeholder="filter"
      aria-label="Filter signals"
      className="ml-auto w-40 border border-ui-ink bg-ui-bg px-2.5 py-2 font-mono text-[13px] text-ui-ink outline-none"
    />

    {actions}
  </div>
)

const segment = cva(
  [
    'cursor-pointer whitespace-nowrap border border-ui-ink px-[18px] py-[9px]',
    'text-[12.5px] font-bold tracking-[0.06em]',
  ].join(' '),
  {
    variants: {
      active: {
        true: 'bg-ui-rule text-ui-bg',
        false: 'bg-transparent text-ui-ink hover:bg-ui-panel',
      },
    },
    defaultVariants: { active: false },
  }
)

export const SignalsAction = ({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer whitespace-nowrap border border-ui-ink bg-transparent px-4 py-2 text-left text-[12.5px] font-bold text-ui-ink hover:bg-ui-panel"
  >
    {children}
  </button>
)
