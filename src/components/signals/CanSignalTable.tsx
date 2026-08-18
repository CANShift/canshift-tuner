import { useState } from 'react'
import type { SignalDef } from '@canshift/core'
import { cn } from '@/lib/utils'
import { formatByteRange, parseByteRange } from '../../lib/signal-bytes'
import type { SignalUsage } from '../../hooks/useSignalUsage'

const GRID = [
  'grid-cols-[minmax(140px,1fr)_132px_104px_128px_116px_minmax(120px,260px)] gap-5',
  'min-[1180px]:grid-cols-[minmax(180px,1fr)_132px_104px_128px_116px_minmax(150px,260px)]',
  'min-[1180px]:gap-10',
].join(' ')
const DECIMALS = 1
const NO_VALUE = '—'

export interface CanSignalTableProps {
  signals: readonly SignalDef[]
  values: Record<string, number>
  usage: SignalUsage
  onPatch: (name: string, patch: Partial<SignalDef>) => void
}

const formatValue = (value: number | undefined): string => {
  if (value === undefined) return NO_VALUE
  return Number.isInteger(value) ? String(value) : value.toFixed(DECIMALS)
}

export const CanSignalTable = ({ signals, values, usage, onPatch }: CanSignalTableProps) => (
  <div className="min-h-0 flex-1 overflow-y-auto">
    <div
      className={cn(
        'sticky top-0 z-[2] grid border-b-2 border-ui-rule bg-ui-panel px-7 py-3',
        'font-mono text-[10px] tracking-[0.16em] text-ui-muted',
        GRID
      )}
    >
      <span>SIGNAL</span>
      <span>CAN ID</span>
      <span>BYTES</span>
      <span className="text-right">VALUE</span>
      <span>UNIT</span>
      <span>USED ON PAGES</span>
    </div>
    {signals.map((signal) => (
      <SignalRow
        key={signal.name}
        signal={signal}
        value={values[signal.name]}
        pages={usage.get(signal.name) ?? []}
        onPatch={onPatch}
      />
    ))}
  </div>
)

interface SignalRowProps {
  signal: SignalDef
  value: number | undefined
  pages: number[]
  onPatch: (name: string, patch: Partial<SignalDef>) => void
}

const SignalRow = ({ signal, value, pages, onPatch }: SignalRowProps) => {
  const unused = pages.length === 0
  return (
    <div
      className={cn(
        'group grid items-center border-b border-ui-line px-7 py-[15px] font-mono text-[14px]',
        'hover:bg-ui-panel',
        unused ? 'text-ui-faint' : 'text-ui-ink',
        GRID
      )}
    >
      <span className="truncate font-bold">{signal.name}</span>
      <CellInput
        value={signal.canFrameId}
        label={`CAN ID for ${signal.name}`}
        accent
        onCommit={(next) => {
          if (next.length > 0) onPatch(signal.name, { canFrameId: next })
        }}
      />
      <CellInput
        value={formatByteRange(signal.startByte, signal.byteLength)}
        label={`Bytes for ${signal.name}`}
        validate={(next) => parseByteRange(next) !== null}
        onCommit={(next) => {
          const range = parseByteRange(next)
          if (range) onPatch(signal.name, range)
        }}
      />
      <span className="text-right tabular-nums">{formatValue(value)}</span>
      <span className="text-[13px] text-ui-faint">{signal.unit}</span>
      <span className="flex flex-wrap gap-1">
        {pages.map((page) => (
          <span key={page} className="border border-ui-line-strong px-[7px] text-[11.5px]">
            {page}
          </span>
        ))}
        {unused && <span className="text-[12px] text-ui-faint">not used</span>}
      </span>
    </div>
  )
}

interface CellInputProps {
  value: string
  label: string
  accent?: boolean
  validate?: (next: string) => boolean
  onCommit: (next: string) => void
}

const CellInput = ({ value, label, accent = false, validate, onCommit }: CellInputProps) => {
  const [draft, setDraft] = useState(value)
  const [dirty, setDirty] = useState(false)
  const shown = dirty ? draft : value
  const invalid = dirty && validate !== undefined && !validate(draft)

  const commit = () => {
    setDirty(false)
    if (invalid || draft === value) return
    onCommit(draft.trim())
  }

  return (
    <input
      value={shown}
      aria-label={label}
      spellCheck={false}
      onChange={(e) => {
        setDraft(e.target.value)
        setDirty(true)
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') setDirty(false)
      }}
      className={cn(
        'w-full border bg-transparent px-1.5 py-1 font-mono text-[13.5px] outline-none',
        invalid ? 'border-ui-danger text-ui-danger' : 'border-ui-line hover:border-ui-ink',
        accent && !invalid ? 'text-ui-accent' : 'text-inherit'
      )}
    />
  )
}
