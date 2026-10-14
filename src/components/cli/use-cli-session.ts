import { useCallback, useRef, useState } from 'react'
import { useCliContext } from '../../hooks/useCliContext'
import { COMMAND_NAMES, type CliLine, type RawResult } from '../../lib/cli/commands'
import { suggest } from '../../lib/cli/parse'
import { appendCapped, historyCursor, runLine, withHistory } from './cli-session'

const GREETING: CliLine[] = [{ tone: 'out', text: 'type /help for commands' }]

const useCliOutput = () => {
  const [lines, setLines] = useState<CliLine[]>(GREETING)
  const outputRef = useRef<HTMLDivElement>(null)
  const onAsync = useCallback((result: RawResult) => {
    setLines((previous) => [...previous, { tone: result.ok ? 'ok' : 'error', text: result.text }])
  }, [])
  const push = (next: CliLine[]) => {
    setLines((previous) => appendCapped(previous, next))
    requestAnimationFrame(() => {
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight })
    })
  }
  return { lines, outputRef, onAsync, push }
}

const useHistory = (setInput: (value: string) => void) => {
  const historyRef = useRef<string[]>([])
  const cursorRef = useRef(-1)
  const remember = (raw: string) => {
    historyRef.current = withHistory(historyRef.current, raw)
    cursorRef.current = -1
  }
  const walk = (direction: 1 | -1) => {
    const history = historyRef.current
    if (history.length === 0) return
    cursorRef.current = historyCursor(cursorRef.current, direction, history.length)
    setInput(cursorRef.current === -1 ? '' : (history[cursorRef.current] ?? ''))
  }
  return { remember, walk }
}

export const useCliSession = () => {
  const output = useCliOutput()
  const context = useCliContext(output.onAsync)
  const [input, setInput] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const history = useHistory(setInput)
  const edit = (value: string) => {
    setInput(value)
    setHighlighted(0)
  }
  const submit = () => {
    edit('')
    const next = runLine(input, context)
    if (next === null) return
    history.remember(input)
    output.push(next)
  }
  return {
    ...output,
    context,
    input,
    edit,
    highlighted,
    setHighlighted,
    submit,
    walkHistory: history.walk,
    suggestions: suggest(input, COMMAND_NAMES),
  }
}

export type CliSession = ReturnType<typeof useCliSession>
