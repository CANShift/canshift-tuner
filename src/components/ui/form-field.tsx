import type { ReactNode } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export interface SectionProps {
  title: string
  children: ReactNode
}

export const Section = ({ title, children }: SectionProps) => (
  <fieldset className="grid gap-2 border border-border p-3">
    <legend className="px-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
      {title}
    </legend>
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
  </fieldset>
)

export interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
}

export const NumberField = ({ label, value, onChange }: NumberFieldProps) => (
  <label className="grid gap-1 text-xs">
    <span className="text-text-muted">{label}</span>
    <Input
      type="number"
      value={String(value)}
      onChange={(e) => {
        const next = Number(e.target.value)
        onChange(Number.isNaN(next) ? 0 : next)
      }}
    />
  </label>
)

export interface TextFieldProps {
  label: string
  value: string
  maxLength?: number
  onChange: (value: string) => void
}

export const TextField = ({ label, value, maxLength, onChange }: TextFieldProps) => (
  <label className="grid gap-1 text-xs">
    <span className="text-text-muted">{label}</span>
    <Input
      value={value}
      {...(maxLength !== undefined ? { maxLength } : {})}
      onChange={(e) => {
        onChange(e.target.value)
      }}
    />
  </label>
)

export interface BoolFieldProps {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

export const BoolField = ({ label, value, onChange }: BoolFieldProps) => (
  <label className="flex items-center justify-between gap-3 text-xs">
    <span className="text-text-muted">{label}</span>
    <Switch checked={value} onCheckedChange={onChange} />
  </label>
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

export interface SelectFieldProps {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}

export const SelectField = ({ label, value, options, onChange }: SelectFieldProps) => (
  <label className="grid gap-1 text-xs">
    <span className="text-text-muted">{label}</span>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </label>
)
