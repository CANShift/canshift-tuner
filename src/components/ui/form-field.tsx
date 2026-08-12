import type { InputHTMLAttributes, ReactNode } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

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

export interface PanelFieldProps {
  label: string
  children: ReactNode
  onReset?: (() => void) | undefined
}

export const PanelField = ({ label, children, onReset }: PanelFieldProps) => (
  <div className="mb-2.5">
    <div className="mb-[3px] flex items-center gap-1">
      <label className="block text-[10px] uppercase tracking-[0.06em] text-[hsl(var(--brand-neutral-500))]">
        {label}
      </label>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          title="Reset to default"
          aria-label={`Reset ${label} to default`}
          className="h-[14px] w-[14px] cursor-pointer border-none bg-transparent p-0 text-[11px] leading-[14px] text-[hsl(var(--brand-neutral-500))]"
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
  <div className="mb-0.5 text-[9px] text-brand-neutral-600">{children}</div>
)

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <div className="text-[10px] uppercase tracking-[0.06em] text-brand-neutral-600">{children}</div>
)

export const segmentPill = cva('flex-1 cursor-pointer border border-solid py-[3px] text-[10px]', {
  variants: {
    tone: { blue: '', green: '' },
    active: {
      true: '',
      false: 'border-brand-neutral-300 bg-brand-neutral-100 text-brand-neutral-600',
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
      'h-auto border-[hsl(var(--brand-neutral-300))] bg-[hsl(var(--brand-neutral-100))] px-[7px] py-1 text-xs text-[hsl(var(--brand-neutral-700))]',
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
