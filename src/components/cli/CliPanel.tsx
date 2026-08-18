import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useUiStore } from '../../stores/ui.store'
import { useCliContext } from '../../hooks/useCliContext'
import { COMMAND_NAMES, findCommand, type CliLine, type RawResult } from '../../lib/cli/commands'
import { parseCommand, suggest } from '../../lib/cli/parse'

const LINE_CAP = 200
const HISTORY_CAP = 50
const PROMPT = '>'

const TONE_CLASS: Record<CliLine['tone'], string> = {
  out: 'text-ui-console-ink',
  ok: 'text-ui-ok',
  error: 'text-ui-engaged',
}

export const CliPanel = () => {
  const toggleCli = useUiStore((s) => s.toggleCli)

  const [lines, setLines] = useState<CliLine[]>([{ tone: 'out', text: 'type /help for commands' }])
  const [input, setInput] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const historyRef = useRef<string[]>([])
  const cursorRef = useRef(-1)
  const outputRef = useRef<HTMLDivElement>(null)

  const onAsync = useCallback((result: RawResult) => {
    setLines((previous) => [...previous, { tone: result.ok ? 'ok' : 'error', text: result.text }])
  }, [])
  const context = useCliContext(onAsync)

  const suggestions = suggest(input, COMMAND_NAMES)

  const push = (next: CliLine[]) => {
    setLines((previous) => {
      const all = [...previous, ...next]
      return all.length > LINE_CAP ? all.slice(all.length - LINE_CAP) : all
    })
    requestAnimationFrame(() => {
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight })
    })
  }

  const submit = () => {
    const raw = input
    setInput('')
    setHighlighted(0)
    const invocation = parseCommand(raw)
    if (invocation === null) return

    historyRef.current = [raw, ...historyRef.current.filter((entry) => entry !== raw)]
    if (historyRef.current.length > HISTORY_CAP) historyRef.current.length = HISTORY_CAP
    cursorRef.current = -1

    const command = findCommand(invocation.name)
    if (command === undefined) {
      push([
        { tone: 'out', text: `${PROMPT} ${raw.trim()}` },
        { tone: 'error', text: `No command "${invocation.name}". Try /help.` },
      ])
      return
    }
    push([
      { tone: 'out', text: `${PROMPT} ${raw.trim()}` },
      ...command.run(context, invocation.args),
    ])
  }

  const accept = (name: string) => {
    setInput(`/${name} `)
    setHighlighted(0)
  }

  const walkHistory = (direction: 1 | -1) => {
    const history = historyRef.current
    if (history.length === 0) return
    const next = Math.min(history.length - 1, Math.max(-1, cursorRef.current + direction))
    cursorRef.current = next
    setInput(next === -1 ? '' : (history[next] ?? ''))
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      submit()
      return
    }
    if (event.key === 'Tab' && suggestions.length > 0) {
      event.preventDefault()
      accept(suggestions[highlighted] ?? suggestions[0] ?? '')
      return
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      if (suggestions.length > 1) {
        setHighlighted((current) => {
          const next = current + (event.key === 'ArrowDown' ? 1 : -1)
          return (next + suggestions.length) % suggestions.length
        })
        return
      }
      walkHistory(event.key === 'ArrowUp' ? 1 : -1)
    }
  }

  return (
    <div className="flex h-[148px] shrink-0 flex-col bg-ui-console font-mono text-ui-console-ink">
      <div className="flex shrink-0 items-center gap-3.5 border-b border-white/[0.12] px-4 py-[9px] text-[10.5px] tracking-[0.16em] text-ui-faint">
        <span>CLI</span>
        <span>
          type <span className="text-ui-engaged">/help</span> for commands
        </span>
        <span className="ml-auto flex items-center gap-3.5 tracking-[0.12em]">
          {context.hasDevice && <span className="text-ui-ok">{context.deviceLabel}</span>}
          <button
            type="button"
            onClick={toggleCli}
            title="Collapse the CLI"
            className="cursor-pointer border-0 bg-transparent font-[inherit] text-[13px] text-ui-faint hover:text-ui-console-ink"
          >
            ▼
          </button>
        </span>
      </div>

      <div
        ref={outputRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3 text-[13px] leading-[1.7]"
      >
        {lines.map((line, index) => (
          <div key={`${String(index)}-${line.text}`} className={TONE_CLASS[line.tone]}>
            {line.text}
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="max-h-[104px] shrink-0 overflow-y-auto border-t border-white/[0.12] bg-[#141414]">
          {suggestions.map((name, index) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                accept(name)
              }}
              className={cn(
                'block w-full cursor-pointer border-0 px-4 py-1 text-left text-[13px]',
                index === highlighted ? 'bg-white/[0.08]' : 'bg-transparent'
              )}
            >
              <span className="text-ui-engaged">/</span>
              <span className="text-ui-console-ink">{name}</span>
              <span className="ml-3 text-ui-faint">{findCommand(name)?.hint}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2.5 border-t border-white/[0.12] px-4 py-2.5">
        <span className="text-[14px] text-ui-engaged">{PROMPT}</span>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setHighlighted(0)
          }}
          onKeyDown={onKeyDown}
          placeholder="/help"
          aria-label="CLI command"
          spellCheck={false}
          className="flex-1 border-0 bg-transparent font-mono text-[14px] text-ui-console-ink outline-none"
        />
      </div>
    </div>
  )
}
