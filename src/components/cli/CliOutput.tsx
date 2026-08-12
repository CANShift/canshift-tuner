import { useEffect, useRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type CliEntryKind = 'request' | 'ok' | 'error' | 'info'

export interface CliEntry {
  id: number
  kind: CliEntryKind
  timestamp: Date
  label: string
  payload?: Record<string, unknown> | null
}

export interface CliOutputProps {
  entries: readonly CliEntry[]
  onClear: () => void
}

export const CliOutput = ({ entries, onClear }: CliOutputProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const lastIdRef = useRef<number | null>(null)

  useEffect(() => {
    const last = entries[entries.length - 1]
    if (!last) return
    if (last.id === lastIdRef.current) return
    lastIdRef.current = last.id
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [entries])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-background px-3.5 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
          Console
        </span>
        <button
          type="button"
          onClick={onClear}
          disabled={entries.length === 0}
          className={cn(clearButton({ disabled: entries.length === 0 }))}
        >
          Clear
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-2.5 font-mono text-[12px]">
        {entries.length === 0 ? (
          <div className="py-8 text-center font-[system-ui,sans-serif] text-[12px] text-text-muted">
            Send a command to see the response here.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[auto_auto_1fr] items-baseline gap-2.5 border-b border-border/50 py-1"
            >
              <span className="tabular-nums text-text-muted">{formatTime(entry.timestamp)}</span>
              <span className={cn('w-[14px] text-center font-semibold', KIND_TEXT[entry.kind])}>
                {kindLabel(entry.kind)}
              </span>
              <span className="break-words text-text">{entry.label}</span>
              {entry.payload && Object.keys(entry.payload).length > 0 && (
                <pre className="col-[3/span_1] m-0 mt-1 whitespace-pre-wrap border border-border bg-background px-2.5 py-1.5 text-[11px] text-text-dim">
                  {formatPayload(entry.payload)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const formatTime = (d: Date): string => {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

const kindLabel = (kind: CliEntryKind): string => {
  switch (kind) {
    case 'request':
      return '→'
    case 'ok':
      return '✓'
    case 'error':
      return '✗'
    case 'info':
      return 'ℹ'
  }
}

const KIND_TEXT: Record<CliEntryKind, string> = {
  request: 'text-brand-accent',
  ok: 'text-success',
  error: 'text-destructive',
  info: 'text-text-dim',
}

const formatPayload = (payload: Record<string, unknown>): string => {
  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
}

const clearButton = cva(
  'border border-border px-2.5 py-[3px] text-[10px] uppercase tracking-[0.06em]',
  {
    variants: {
      disabled: {
        true: 'cursor-not-allowed bg-bg-inset text-text-muted',
        false: 'cursor-pointer bg-surface text-text-dim',
      },
    },
    defaultVariants: { disabled: false },
  }
)
