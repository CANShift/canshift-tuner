import { useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

export interface InlineInputProps {
  value: string
  label: string
  validate?: (next: string) => boolean
  onCommit: (next: string) => void
  className?: string
}

const FIELD =
  'min-w-0 border border-transparent bg-transparent px-1 py-0.5 font-mono outline-none hover:border-ui-line-strong focus:border-ui-ink'

const useDraft = (value: string, validate: InlineInputProps['validate']) => {
  const [draft, setDraft] = useState(value)
  const [dirty, setDirty] = useState(false)
  const invalid = dirty && validate !== undefined && !validate(draft)
  const edit = (next: string) => {
    setDraft(next)
    setDirty(true)
  }
  return { shown: dirty ? draft : value, draft, dirty, invalid, edit, reset: () => setDirty(false) }
}

export const InlineInput = ({ value, label, validate, onCommit, className }: InlineInputProps) => {
  const { shown, draft, invalid, edit, reset } = useDraft(value, validate)

  const commit = () => {
    reset()
    if (invalid || draft === value) return
    onCommit(draft.trim())
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur()
    if (event.key === 'Escape') reset()
  }

  return (
    <input
      value={shown}
      aria-label={label}
      spellCheck={false}
      onChange={(event) => edit(event.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={cn(FIELD, invalid ? 'border-ui-danger text-ui-danger' : 'text-inherit', className)}
    />
  )
}
