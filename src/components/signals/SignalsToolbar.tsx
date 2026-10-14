import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

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
  groups: readonly ProfileGroup[]
  profileKey: string
  onProfile: (key: string) => void
  source: SignalSource
  onSource: (source: SignalSource) => void
  usedCount: number
  totalCount: number
  hideUnused: boolean
  onHideUnused: (hide: boolean) => void
  filter: string
  onFilter: (filter: string) => void
  actions: ReactNode
}

const SOURCE_LABELS: Record<SignalSource, string> = { can: 'CAN', obd2: 'OBD-II' }
const SOURCES = Object.keys(SOURCE_LABELS) as SignalSource[]

const BAR =
  'flex min-h-[54px] shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b-2 border-ui-rule px-3 py-2 md:px-6'

const segment = cva(
  'cursor-pointer whitespace-nowrap border border-ui-ink px-3.5 py-[7px] text-[12.5px]',
  {
    variants: {
      active: {
        true: 'bg-ui-rule font-bold text-ui-bg',
        false: 'bg-transparent text-ui-ink hover:bg-ui-panel',
      },
    },
    defaultVariants: { active: false },
  }
)

type ProfileSelectProps = Pick<SignalsToolbarProps, 'groups' | 'profileKey' | 'onProfile'>

const ProfileSelect = ({ groups, profileKey, onProfile }: ProfileSelectProps) => (
  <select
    value={profileKey}
    onChange={(e) => {
      onProfile(e.target.value)
    }}
    aria-label="ECU profile"
    className="max-w-[220px] border border-ui-ink bg-ui-bg py-[7px] pl-2.5 pr-[26px] text-[13px] font-bold text-ui-ink"
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
)

const SourceSwitch = ({ source, onSource }: Pick<SignalsToolbarProps, 'source' | 'onSource'>) => (
  <div className="flex gap-px">
    {SOURCES.map((value) => (
      <button
        key={value}
        type="button"
        aria-pressed={value === source}
        onClick={() => {
          onSource(value)
        }}
        className={cn(segment({ active: value === source }))}
      >
        {SOURCE_LABELS[value]}
      </button>
    ))}
  </div>
)

type HideUnusedProps = Pick<SignalsToolbarProps, 'hideUnused' | 'onHideUnused'>

const HideUnused = ({ hideUnused, onHideUnused }: HideUnusedProps) => (
  <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ui-ink">
    <Checkbox
      checked={hideUnused}
      onCheckedChange={(checked) => {
        onHideUnused(checked === true)
      }}
    />
    Hide unused
  </label>
)

const FilterInput = ({ filter, onFilter }: Pick<SignalsToolbarProps, 'filter' | 'onFilter'>) => (
  <input
    value={filter}
    onChange={(e) => {
      onFilter(e.target.value)
    }}
    placeholder="Filter"
    aria-label="Filter signals"
    className="w-36 border border-ui-ink bg-ui-bg px-2.5 py-[7px] text-[13px] text-ui-ink outline-none md:ml-auto"
  />
)

export const SignalsToolbar = (props: SignalsToolbarProps) => (
  <div className={BAR}>
    <ProfileSelect
      groups={props.groups}
      profileKey={props.profileKey}
      onProfile={props.onProfile}
    />
    <SourceSwitch source={props.source} onSource={props.onSource} />
    <span className="whitespace-nowrap text-[12.5px] text-ui-muted">
      {props.usedCount} of {props.totalCount} used
    </span>
    <HideUnused hideUnused={props.hideUnused} onHideUnused={props.onHideUnused} />
    <FilterInput filter={props.filter} onFilter={props.onFilter} />
    {props.actions}
  </div>
)

const ACTION = cva('whitespace-nowrap border px-3.5 py-[7px] text-[12.5px] font-bold', {
  variants: {
    disabled: {
      true: 'cursor-not-allowed border-ui-line bg-transparent text-ui-faint',
      false: 'cursor-pointer border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel',
    },
  },
  defaultVariants: { disabled: false },
})

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
    className={cn(ACTION({ disabled }))}
  >
    {children}
  </button>
)

export const SIGNALS_ACTION_CLASS = cn(ACTION({ disabled: false }))
