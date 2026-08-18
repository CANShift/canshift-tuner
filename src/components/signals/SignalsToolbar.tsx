import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type SignalSource = 'can' | 'obd2'

export interface ProfileOption {
  key: string
  label: string
}

export interface ProfileGroup {
  label: string
  options: readonly ProfileOption[]
}

export interface SignalsToolbarProps {
  source: SignalSource
  onSource: (source: SignalSource) => void
  groups: readonly ProfileGroup[]
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
  groups,
  profileKey,
  onProfile,
  meta,
  filter,
  onFilter,
  actions,
}: SignalsToolbarProps) => (
  <div className="flex h-[54px] shrink-0 items-center gap-2.5 border-b-2 border-ui-rule px-6 min-[1180px]:gap-4">
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
      className="max-w-[150px] border border-ui-ink bg-ui-bg py-2 pl-2.5 pr-[26px] font-mono text-[13px] font-bold text-ui-ink min-[1180px]:max-w-[220px]"
    >
      {groups.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </optgroup>
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
      className="ml-auto w-28 border border-ui-ink bg-ui-bg px-2.5 py-2 font-mono text-[13px] text-ui-ink outline-none min-[1180px]:w-40"
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

const ACTION_BASE = 'whitespace-nowrap border px-4 py-2 text-left text-[12.5px] font-bold'
const ACTION_ENABLED = 'cursor-pointer border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel'
const ACTION_DISABLED = 'cursor-not-allowed border-ui-line bg-transparent text-ui-faint'

export interface SignalsFileActionProps {
  accept: string
  onFile: (file: File) => void
  children: ReactNode
}

export const SignalsFileAction = ({ accept, onFile, children }: SignalsFileActionProps) => (
  <label className={cn(ACTION_BASE, ACTION_ENABLED)}>
    {children}
    <input
      type="file"
      accept={accept}
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) onFile(file)
        e.target.value = ''
      }}
    />
  </label>
)

export interface SignalsActionProps {
  onClick: () => void
  disabled?: boolean
  title?: string | undefined
  children: ReactNode
}

export const SignalsAction = ({
  onClick,
  disabled = false,
  title,
  children,
}: SignalsActionProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(ACTION_BASE, disabled ? ACTION_DISABLED : ACTION_ENABLED)}
  >
    {children}
  </button>
)
