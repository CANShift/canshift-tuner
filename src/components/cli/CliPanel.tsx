import { cn } from '@/lib/utils'
import { useUiStore } from '../../stores/ui.store'
import { findCommand, type CliLine } from '../../lib/cli/commands'
import { PROMPT } from './cli-session'
import { useCliSession, type CliSession } from './use-cli-session'

const TONE_CLASS: Record<CliLine['tone'], string> = {
  out: 'text-ui-console-ink',
  ok: 'text-ui-ok',
  error: 'text-ui-engaged',
}

type KeyEvent = React.KeyboardEvent<HTMLInputElement>

const acceptSuggestion = (session: CliSession, name: string) => {
  session.edit(`/${name} `)
}

const stepSuggestion = (session: CliSession, step: number) => {
  const count = session.suggestions.length
  session.setHighlighted((current) => (current + step + count) % count)
}

const arrow = (step: 1 | -1, historyStep: 1 | -1) => (session: CliSession, event: KeyEvent) => {
  event.preventDefault()
  if (session.suggestions.length > 1) {
    stepSuggestion(session, step)
    return
  }
  session.walkHistory(historyStep)
}

const KEY_HANDLERS: Record<string, (session: CliSession, event: KeyEvent) => void> = {
  Enter: (session, event) => {
    event.preventDefault()
    session.submit()
  },
  Tab: (session, event) => {
    const { suggestions, highlighted } = session
    if (suggestions.length === 0) return
    event.preventDefault()
    acceptSuggestion(session, suggestions[highlighted] ?? suggestions[0] ?? '')
  },
  ArrowDown: arrow(1, -1),
  ArrowUp: arrow(-1, 1),
}

const CliHeader = ({ session }: { session: CliSession }) => {
  const toggleCli = useUiStore((s) => s.toggleCli)
  return (
    <div className="flex shrink-0 items-center gap-3.5 border-b border-white/[0.12] px-4 py-[9px] text-[10.5px] tracking-[0.16em] text-ui-faint">
      <span>CLI</span>
      <span>
        type <span className="text-ui-engaged">/help</span> for commands
      </span>
      <span className="ml-auto flex items-center gap-3.5 tracking-[0.12em]">
        {session.context.hasDevice && (
          <span className="text-ui-ok">{session.context.deviceLabel}</span>
        )}
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
  )
}

const CliOutput = ({ session }: { session: CliSession }) => (
  <div
    ref={session.outputRef}
    className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3 text-[13px] leading-[1.7]"
  >
    {session.lines.map((line, index) => (
      <div key={`${String(index)}-${line.text}`} className={TONE_CLASS[line.tone]}>
        {line.text}
      </div>
    ))}
  </div>
)

const CliSuggestions = ({ session }: { session: CliSession }) =>
  session.suggestions.length === 0 ? null : (
    <div className="max-h-[104px] shrink-0 overflow-y-auto border-t border-white/[0.12] bg-[#141414]">
      {session.suggestions.map((name, index) => (
        <button
          key={name}
          type="button"
          onClick={() => acceptSuggestion(session, name)}
          className={cn(
            'block w-full cursor-pointer border-0 px-4 py-1 text-left text-[13px]',
            index === session.highlighted ? 'bg-white/[0.08]' : 'bg-transparent'
          )}
        >
          <span className="text-ui-engaged">/</span>
          <span className="text-ui-console-ink">{name}</span>
          <span className="ml-3 text-ui-faint">{findCommand(name)?.hint}</span>
        </button>
      ))}
    </div>
  )

const CliPrompt = ({ session }: { session: CliSession }) => (
  <div className="flex shrink-0 items-center gap-2.5 border-t border-white/[0.12] px-4 py-2.5">
    <span className="text-[14px] text-ui-engaged">{PROMPT}</span>
    <input
      value={session.input}
      onChange={(e) => session.edit(e.target.value)}
      onKeyDown={(event) => KEY_HANDLERS[event.key]?.(session, event)}
      placeholder="/help"
      aria-label="CLI command"
      spellCheck={false}
      className="flex-1 border-0 bg-transparent font-mono text-[14px] text-ui-console-ink outline-none"
    />
  </div>
)

export const CliPanel = () => {
  const session = useCliSession()
  return (
    <div className="flex h-[148px] shrink-0 flex-col bg-ui-console font-mono text-ui-console-ink">
      <CliHeader session={session} />
      <CliOutput session={session} />
      <CliSuggestions session={session} />
      <CliPrompt session={session} />
    </div>
  )
}
