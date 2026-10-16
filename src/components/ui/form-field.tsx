import type { InputHTMLAttributes, ReactNode } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface PanelFieldProps {
  label: string
  children: ReactNode
  onReset?: (() => void) | undefined
}

export const PanelField = ({ label, children, onReset }: PanelFieldProps) => (
  <div className="mb-2.5">
    <div className="mb-[3px] flex items-center gap-1">
      <label className="block text-[10px] uppercase tracking-[0.06em] text-app-muted">
        {label}
      </label>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          title="Reset to default"
          aria-label={`Reset ${label} to default`}
          className="h-[14px] w-[14px] cursor-pointer border-none bg-transparent p-0 text-[11px] leading-[14px] text-app-muted"
        >
          <span aria-hidden="true">↺</span>
        </button>
      )}
    </div>
    {children}
  </div>
)

export const PanelRow = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-1.5">{children}</div>
)

export const FieldLabel = ({ children }: { children: ReactNode }) => (
  <div className="mb-0.5 text-[9px] text-app-muted">{children}</div>
)

export const segmentPill = cva('flex-1 cursor-pointer border border-solid py-[3px] text-[10px]', {
  variants: {
    tone: { blue: '', green: '' },
    active: {
      true: '',
      false: 'border-app-divider bg-app-surface text-app-muted',
    },
  },
  compoundVariants: [
    {
      tone: 'blue',
      active: true,
      class: 'border-[#5566AA] bg-[color-mix(in_srgb,#5566AA_14%,transparent)] text-[#7788CC]',
    },
    {
      tone: 'green',
      active: true,
      class:
        'border-[#448844] bg-[color-mix(in_srgb,#448844_14%,transparent)] font-bold text-[#66AA66]',
    },
    { tone: 'green', active: false, class: 'font-normal' },
  ],
  defaultVariants: { tone: 'green', active: false },
})

export type PanelInputProps = InputHTMLAttributes<HTMLInputElement>

export const PanelInput = ({ className, ...props }: PanelInputProps) => (
  <Input
    className={cn(
      'h-auto border-app-divider bg-app-surface px-[7px] py-1 text-xs text-app-text',
      className
    )}
    {...props}
  />
)

const NONE_VALUE = '__none__'

export interface CompactSelectOption {
  value: string
  label: string
}

export interface CompactSelectProps {
  value: string
  options: CompactSelectOption[]
  onChange: (value: string) => void
  ariaLabel?: string
}

export const CompactSelect = ({ value, options, onChange, ariaLabel }: CompactSelectProps) => (
  <Select
    value={value === '' ? NONE_VALUE : value}
    onValueChange={(next) => {
      onChange(next === NONE_VALUE ? '' : next)
    }}
  >
    <SelectTrigger
      className="h-7 px-2 text-xs"
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
    >
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem
          key={option.value === '' ? NONE_VALUE : option.value}
          value={option.value === '' ? NONE_VALUE : option.value}
          className="text-xs"
        >
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)
