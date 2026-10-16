import { useEffect, useState } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const swatch = cva('size-3.5 shrink-0 rounded-[4px] border-2', {
  variants: { tone: { warning: 'border-app-warning', danger: 'border-app-accent' } },
})

const field = cva(
  'h-12 w-[84px] rounded-control border-[1.5px] bg-app-bg px-3 text-right text-base text-app-text lg:h-11',
  { variants: { tone: { warning: 'border-app-warning', danger: 'border-app-accent' } } }
)

export interface LimitInputProps {
  id: string
  label: string
  hint: string
  tone: 'warning' | 'danger'
  value: number | null
  unit: string
  placeholder?: string
  onCommit: (value: number | null) => void
}

const parsed = (text: string): number | null => {
  const value = Number(text.replace(',', '.'))
  return text.trim().length === 0 || Number.isNaN(value) ? null : value
}

const shown = (value: number | null): string => (value === null ? '' : String(value))

const useLimitText = (value: number | null, onCommit: (value: number | null) => void) => {
  const [text, setText] = useState(shown(value))
  useEffect(() => {
    setText(shown(value))
  }, [value])
  const commit = () => {
    onCommit(parsed(text))
    setText(shown(value))
  }
  return { text, setText, commit }
}

const LimitLabel = ({
  id,
  label,
  hint,
  tone,
}: Pick<LimitInputProps, 'id' | 'label' | 'hint' | 'tone'>) => (
  <>
    <span aria-hidden="true" className={cn(swatch({ tone }))} />
    <label htmlFor={id} className="flex flex-1 flex-col text-[15px]">
      {label}
      <span className="text-xs text-app-muted">{hint}</span>
    </label>
  </>
)

export const LimitInput = ({
  id,
  label,
  hint,
  tone,
  value,
  unit,
  placeholder,
  onCommit,
}: LimitInputProps) => {
  const { text, setText, commit } = useLimitText(value, onCommit)
  return (
    <div className="flex min-h-12 items-center gap-2.5">
      <LimitLabel id={id} label={label} hint={hint} tone={tone} />
      <input
        id={id}
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => event.key === 'Enter' && commit()}
        className={cn(field({ tone }))}
      />
      <span className="w-8 text-sm text-app-muted">{unit}</span>
    </div>
  )
}
