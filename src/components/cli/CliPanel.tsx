import { useCallback, useRef, useState } from 'react'
import { useDeviceStore } from '../../stores/device.store'
import { useUiStore } from '../../stores/ui.store'
import { usbService, KNOWN_OPCODES } from '../../transport'
import { CommandForm } from './CommandForm'
import { CliOutput } from './CliOutput'
import type { CliEntry } from './CliOutput'
import { CliOfflineState } from './CliOfflineState'
import { transportErrorText } from '../../transport/humanize-transport-error'
import { errorMessage } from '../../lib/error-message'

const HISTORY_CAP = 50
const ENTRIES_CAP = 200

const formatHex = (value: number): string =>
  `0x${value.toString(16).toUpperCase().padStart(2, '0')}`

const useCliHistory = () => {
  const historyRef = useRef<string[]>([])
  const cursorRef = useRef<number>(-1)

  const remember = useCallback((entry: string) => {
    if (entry === '{}') return
    historyRef.current = [entry, ...historyRef.current.filter((h) => h !== entry)]
    if (historyRef.current.length > HISTORY_CAP) historyRef.current.length = HISTORY_CAP
    cursorRef.current = -1
  }, [])

  const up = useCallback((): string | null => {
    if (historyRef.current.length === 0) return null
    const next = Math.min(cursorRef.current + 1, historyRef.current.length - 1)
    cursorRef.current = next
    return historyRef.current[next] ?? null
  }, [])

  const down = useCallback((): string | null => {
    if (cursorRef.current <= 0) {
      cursorRef.current = -1
      return null
    }
    cursorRef.current -= 1
    return historyRef.current[cursorRef.current] ?? null
  }, [])

  return { remember, up, down }
}

export const CliPanel = () => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const toggleCli = useUiStore((s) => s.toggleCli)
  const [entries, setEntries] = useState<CliEntry[]>([])
  const [busy, setBusy] = useState(false)
  const nextIdRef = useRef(1)
  const history = useCliHistory()

  const canControl = connected && !simulationMode

  const push = useCallback((entry: Omit<CliEntry, 'id' | 'timestamp'>) => {
    setEntries((prev) => {
      const next = prev.concat({ ...entry, id: nextIdRef.current++, timestamp: new Date() })
      if (next.length > ENTRIES_CAP) next.splice(0, next.length - ENTRIES_CAP)
      return next
    })
  }, [])

  const onSubmit = useCallback(
    (cmd: number, fields: Record<string, unknown>) => {
      const knownName = KNOWN_OPCODES.find((o) => o.id === cmd)?.name
      const label = `${formatHex(cmd)}${knownName ? ` (${knownName})` : ''}`
      history.remember(JSON.stringify(fields))
      push({ kind: 'request', label, payload: fields })
      setBusy(true)
      void usbService
        .sendRaw(cmd, fields)
        .then((result) => {
          if (result.kind === 'ok') {
            push({ kind: 'ok', label, payload: result.data })
            return
          }
          push({
            kind: 'error',
            label: `${label} — ${transportErrorText(result.error)}`,
            payload: result.data,
          })
        })
        .catch((err: unknown) => {
          push({ kind: 'error', label: `${label} — ${errorMessage(err)}`, payload: null })
        })
        .finally(() => {
          setBusy(false)
        })
    },
    [history, push]
  )

  return (
    <div className="flex h-[148px] shrink-0 flex-col bg-ui-console font-mono text-ui-console-ink">
      <div className="flex shrink-0 items-center gap-3.5 border-b border-white/[0.12] px-4 py-[9px] text-[10.5px] tracking-[0.16em] text-ui-faint">
        <span>CLI</span>
        <span>raw firmware opcodes over USB</span>
        <button
          type="button"
          onClick={toggleCli}
          title="Collapse the CLI"
          className="ml-auto cursor-pointer border-0 bg-transparent font-[inherit] text-[13px] text-ui-faint hover:text-ui-console-ink"
        >
          ▼
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-2.5">
        {canControl ? (
          <>
            <CommandForm
              disabled={false}
              busy={busy}
              onSubmit={onSubmit}
              onHistoryUp={history.up}
              onHistoryDown={history.down}
            />
            <CliOutput
              entries={entries}
              onClear={() => {
                setEntries([])
              }}
            />
          </>
        ) : (
          <CliOfflineState />
        )}
      </div>
    </div>
  )
}
