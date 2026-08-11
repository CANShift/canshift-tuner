import { useEffect, useMemo, useRef, useState } from 'react'
import { useLogStore } from '../stores/log.store'
import type { LogLevel } from '../stores/log.store'
import { TogglePill, type TogglePillTone } from '../components/ui/toggle-pill'
import { Checkbox } from '../components/ui/checkbox'
import { cn } from '@/lib/utils'
import { RoutePage } from '../components/ui/route-shell'
import { MetaText } from '../components/ui/meta-text'

const ALL_LEVELS: LogLevel[] = ['info', 'success', 'warn', 'error', 'debug']
const LEVEL_TEXT: Record<LogLevel, string> = {
  info: 'text-brand-neutral-700',
  success: 'text-success',
  warn: 'text-warning',
  error: 'text-status-danger',
  debug: 'text-brand-neutral-500',
}
const LEVEL_TONE: Record<LogLevel, TogglePillTone> = {
  info: 'neutral',
  success: 'success',
  warn: 'warning',
  error: 'danger',
  debug: 'muted',
}

const STICK_THRESHOLD_PX = 32

const LogsRoute = () => {
  const entries = useLogStore((s) => s.entries)
  const verbose = useLogStore((s) => s.verbose)
  const setVerbose = useLogStore((s) => s.setVerbose)
  const clear = useLogStore((s) => s.clear)

  const [enabledLevels, setEnabledLevels] = useState<Set<LogLevel>>(
    () => new Set<LogLevel>(['info', 'success', 'warn', 'error'])
  )
  const [autoScroll, setAutoScroll] = useState(true)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const visibleLevels = useMemo(() => {
    const next = new Set(enabledLevels)
    if (!verbose) next.delete('debug')
    return next
  }, [enabledLevels, verbose])

  const filtered = useMemo(
    () => entries.filter((e) => visibleLevels.has(e.level)),
    [entries, visibleLevels]
  )

  useEffect(() => {
    if (!autoScroll) return
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [filtered, autoScroll])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distFromBottom <= STICK_THRESHOLD_PX
    if (atBottom !== autoScroll) setAutoScroll(atBottom)
  }

  const toggleLevel = (level: LogLevel) => {
    setEnabledLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  const handleCopy = () => {
    const text = filtered.map(formatEntryForCopy).join('\n')
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyState('copied')
        window.setTimeout(() => {
          setCopyState('idle')
        }, 1500)
      })
      .catch(() => {
        setCopyState('failed')
        window.setTimeout(() => {
          setCopyState('idle')
        }, 1500)
      })
  }

  const copyLabel =
    copyState === 'copied' ? 'Copied ✓' : copyState === 'failed' ? 'Copy failed' : 'Copy all'

  return (
    <RoutePage className="relative">
      <header className="flex min-h-12 shrink-0 flex-wrap items-center gap-3.5 border-b-2 border-brand-divider px-5 py-1">
        <span className="text-[14px] font-extrabold text-brand-text">Logs</span>
        <MetaText className="whitespace-nowrap">
          {filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'} · {entries.length} total
        </MetaText>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {ALL_LEVELS.map((level) => {
            if (level === 'debug' && !verbose) return null
            const active = visibleLevels.has(level)
            return (
              <TogglePill
                key={level}
                active={active}
                tone={LEVEL_TONE[level]}
                onClick={() => {
                  toggleLevel(level)
                }}
              >
                {level}
              </TogglePill>
            )
          })}
          <label className="ml-1 inline-flex cursor-pointer items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-brand-neutral-600">
            <Checkbox
              checked={verbose}
              onCheckedChange={(checked) => {
                setVerbose(checked === true)
              }}
            />
            verbose
          </label>
          <div className="mx-1 h-[18px] w-px bg-brand-neutral-300" />
          <button
            type="button"
            className={cn(SECONDARY_BUTTON, filtered.length === 0 ? DISABLED : ENABLED)}
            onClick={handleCopy}
            disabled={filtered.length === 0}
          >
            {copyLabel}
          </button>
          <button
            type="button"
            className={cn(SECONDARY_BUTTON, entries.length === 0 ? DISABLED : ENABLED)}
            onClick={clear}
            disabled={entries.length === 0}
          >
            CLEAR
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-7 py-3 font-mono text-[12px] leading-[1.55]"
      >
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center font-sans text-[13px] text-brand-neutral-500">
            {entries.length === 0
              ? 'No log entries yet.'
              : 'Every entry is hidden by the current filter.'}
          </div>
        ) : (
          filtered.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 py-0.5">
              <span className="shrink-0 tabular-nums text-brand-neutral-500">
                {formatTimestamp(entry.timestamp)}
              </span>
              <span
                className={cn(
                  'shrink-0 whitespace-pre font-semibold tracking-[0.04em]',
                  LEVEL_TEXT[entry.level]
                )}
              >
                {entry.level.toUpperCase().padEnd(7)}
              </span>
              {entry.scope && (
                <span className="shrink-0 text-brand-neutral-500">[{entry.scope}]</span>
              )}
              <span className="flex-1 break-words text-brand-text">{entry.message}</span>
            </div>
          ))
        )}
      </div>

      {!autoScroll && filtered.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setAutoScroll(true)
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer border border-brand-neutral-400 bg-brand-chrome-surface px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-brand-text shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        >
          Jump to latest ↓
        </button>
      )}
    </RoutePage>
  )
}

const SECONDARY_BUTTON =
  'border border-brand-neutral-400 bg-none px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em]'
const ENABLED = 'cursor-pointer text-brand-text'
const DISABLED = 'cursor-not-allowed text-brand-neutral-500'

const formatTimestamp = (d: Date): string => {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

const formatEntryForCopy = (
  entry: ReturnType<typeof useLogStore.getState>['entries'][number]
): string => {
  const ts = formatTimestamp(entry.timestamp)
  const scope = entry.scope ? `[${entry.scope}] ` : ''
  return `${ts}  ${entry.level.toUpperCase().padEnd(7)}  ${scope}${entry.message}`
}

export default LogsRoute
