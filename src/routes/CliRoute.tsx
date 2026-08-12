import { useCallback, useRef, useState } from 'react'
import { useDeviceStore } from '../stores/device.store'
import { usbService, KNOWN_OPCODES } from '../transport'
import { CommandForm } from '../components/cli/CommandForm'
import { CliOutput } from '../components/cli/CliOutput'
import type { CliEntry } from '../components/cli/CliOutput'
import { CliOfflineState } from '../components/cli/CliOfflineState'
import { RouteHeader } from '../components/shell/RouteHeader'
import { RouteBody, RoutePage } from '../components/ui/route-shell'
import { Eyebrow } from '../components/ui/meta-text'
import { transportErrorText } from '../transport/humanize-transport-error'
import { errorMessage } from '../lib/error-message'

const HISTORY_CAP = 50
const ENTRIES_CAP = 200

const CliRoute = () => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const [entries, setEntries] = useState<CliEntry[]>([])
  const [busy, setBusy] = useState(false)
  const historyRef = useRef<string[]>([])
  const historyCursorRef = useRef<number>(-1)
  const nextIdRef = useRef(1)

  const canControl = connected && !simulationMode

  const push = useCallback((entry: Omit<CliEntry, 'id' | 'timestamp'>) => {
    setEntries((prev) => {
      const next = prev.concat({
        ...entry,
        id: nextIdRef.current++,
        timestamp: new Date(),
      })
      if (next.length > ENTRIES_CAP) next.splice(0, next.length - ENTRIES_CAP)
      return next
    })
  }, [])

  const onSubmit = useCallback(
    (cmd: number, fields: Record<string, unknown>) => {
      const knownName = KNOWN_OPCODES.find((o) => o.id === cmd)?.name
      const opcodeLabel = `${formatHex(cmd)}${knownName ? ` (${knownName})` : ''}`
      const fieldsJson = JSON.stringify(fields)
      if (fieldsJson !== '{}') {
        historyRef.current = [fieldsJson, ...historyRef.current.filter((h) => h !== fieldsJson)]
        if (historyRef.current.length > HISTORY_CAP) historyRef.current.length = HISTORY_CAP
      }
      historyCursorRef.current = -1
      push({ kind: 'request', label: opcodeLabel, payload: fields })
      setBusy(true)
      void usbService
        .sendRaw(cmd, fields)
        .then((result) => {
          if (result.kind === 'ok') {
            push({ kind: 'ok', label: opcodeLabel, payload: result.data })
          } else {
            push({
              kind: 'error',
              label: `${opcodeLabel} — ${transportErrorText(result.error)}`,
              payload: result.data,
            })
          }
        })
        .catch((err: unknown) => {
          push({ kind: 'error', label: `${opcodeLabel} — ${errorMessage(err)}`, payload: null })
        })
        .finally(() => {
          setBusy(false)
        })
    },
    [push]
  )

  const onHistoryUp = useCallback((): string | null => {
    if (historyRef.current.length === 0) return null
    const nextCursor = Math.min(historyCursorRef.current + 1, historyRef.current.length - 1)
    historyCursorRef.current = nextCursor
    return historyRef.current[nextCursor] ?? null
  }, [])

  const onHistoryDown = useCallback((): string | null => {
    if (historyCursorRef.current <= 0) {
      historyCursorRef.current = -1
      return null
    }
    historyCursorRef.current -= 1
    return historyRef.current[historyCursorRef.current] ?? null
  }, [])

  const onClear = useCallback(() => {
    setEntries([])
  }, [])

  return (
    <RoutePage className="bg-transparent">
      <RouteHeader title="CLI" subtitle="raw firmware opcodes over USB" />

      <RouteBody>
        <div className="flex min-w-0 flex-1 flex-col gap-3.5 overflow-hidden bg-[#0B0A0A] px-5 py-[18px]">
          {canControl ? (
            <>
              <CommandForm
                disabled={false}
                busy={busy}
                onSubmit={onSubmit}
                onHistoryUp={onHistoryUp}
                onHistoryDown={onHistoryDown}
              />
              <CliOutput entries={entries} onClear={onClear} />
            </>
          ) : (
            <CliOfflineState />
          )}
        </div>

        <aside className="w-[290px] shrink-0 overflow-y-auto border-l-2 border-brand-divider bg-brand-neutral-100">
          <Eyebrow className="block border-b-2 border-brand-divider px-[18px] py-3.5">
            COMMANDS
          </Eyebrow>
          {KNOWN_OPCODES.map((op) => (
            <div
              key={op.id}
              className="cursor-help border-b border-brand-neutral-300 px-[18px] py-[11px] font-mono text-[12px] text-brand-neutral-700"
              title={op.description}
            >
              <span className="text-brand-accent">{formatHex(op.id)}</span>{' '}
              {op.name.replace(/^CMD_/, '').toLowerCase()}
            </div>
          ))}
        </aside>
      </RouteBody>
    </RoutePage>
  )
}

const formatHex = (id: number): string => {
  return `0x${id.toString(16).toUpperCase().padStart(2, '0')}`
}

export default CliRoute
