import type { KeyboardEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { CompactSelect } from '../ui/form-field'
import { KNOWN_OPCODES } from '../../transport'
import { errorMessage } from '../../lib/error-message'

export interface CommandFormProps {
  disabled: boolean
  busy: boolean
  onSubmit: (cmd: number, fields: Record<string, unknown>) => void
  onHistoryUp: () => string | null
  onHistoryDown: () => string | null
}

export const CommandForm = ({
  disabled,
  busy,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
}: CommandFormProps) => {
  const [opcodeInput, setOpcodeInput] = useState(formatHex(KNOWN_OPCODES[0]?.id ?? 0))
  const [fieldsInput, setFieldsInput] = useState('{}')
  const [parseError, setParseError] = useState<string | null>(null)
  const fieldsRef = useRef<HTMLTextAreaElement | null>(null)

  const parsedOpcode = useMemo(() => parseOpcode(opcodeInput), [opcodeInput])
  const matched = useMemo(() => KNOWN_OPCODES.find((o) => o.id === parsedOpcode), [parsedOpcode])

  useEffect(() => {
    setParseError(null)
  }, [fieldsInput])

  const handleSubmit = () => {
    if (parsedOpcode === null) {
      setParseError('Opcode must be a hex like 0x05 or a decimal 5')
      return
    }
    const trimmed = fieldsInput.trim()
    if (trimmed.length === 0) {
      onSubmit(parsedOpcode, {})
      return
    }
    let fields: unknown
    try {
      fields = JSON.parse(trimmed)
    } catch (err) {
      setParseError(`JSON parse error — ${errorMessage(err, 'invalid')}`)
      return
    }
    if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
      setParseError('Fields must be a JSON object (got array or primitive)')
      return
    }
    onSubmit(parsedOpcode, fields as Record<string, unknown>)
  }

  const handleFieldsKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
      return
    }
    if (e.key === 'ArrowUp' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      const prev = onHistoryUp()
      if (prev !== null) setFieldsInput(prev)
      return
    }
    if (e.key === 'ArrowDown' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      const next = onHistoryDown()
      setFieldsInput(next ?? '{}')
    }
  }

  return (
    <div className="flex flex-col gap-2 border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <label className={FIELD_LABEL} htmlFor="cli-opcode">
          Opcode
        </label>
        <input
          id="cli-opcode"
          type="text"
          value={opcodeInput}
          onChange={(e) => {
            setOpcodeInput(e.target.value)
          }}
          placeholder="0x05 or 5 or CMD_SCREEN_SETTINGS"
          className="flex-1 border border-border bg-background px-2 py-1.5 font-mono text-[12px] text-text outline-none"
        />
        <CompactSelect
          ariaLabel="Pick a known opcode"
          value={parsedOpcode !== null && matched ? String(parsedOpcode) : ''}
          options={[
            { value: '', label: 'Pick known…' },
            ...KNOWN_OPCODES.map((o) => ({
              value: String(o.id),
              label: `${formatHex(o.id)} · ${o.name}`,
            })),
          ]}
          onChange={(next) => {
            const id = Number(next)
            if (next !== '' && Number.isFinite(id)) setOpcodeInput(formatHex(id))
          }}
        />
      </div>
      {matched && (
        <div className="pl-[68px] text-[11px] text-text-muted">{matched.description}</div>
      )}

      <div className="flex items-center gap-2">
        <label className={FIELD_LABEL} htmlFor="cli-fields">
          Fields
        </label>
      </div>
      <textarea
        ref={fieldsRef}
        id="cli-fields"
        value={fieldsInput}
        onChange={(e) => {
          setFieldsInput(e.target.value)
        }}
        onKeyDown={handleFieldsKey}
        rows={4}
        className="w-full resize-y border border-border bg-background px-2.5 py-2 font-mono text-[12px] text-text outline-none"
        spellCheck={false}
      />
      {parseError && (
        <div className="border border-destructive bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive">
          {parseError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button size="sm" disabled={disabled || busy} onClick={handleSubmit}>
          {busy ? 'Sending…' : 'Send'}
        </Button>
        <span className="text-[10px] uppercase tracking-[0.06em] text-text-muted">
          ⌘/Ctrl ↩ to send · ⌘/Ctrl ↑↓ for history
        </span>
      </div>
    </div>
  )
}

const parseOpcode = (input: string): number | null => {
  const trimmed = input.trim()
  if (!trimmed) return null
  const known = KNOWN_OPCODES.find((o) => o.name.toLowerCase() === trimmed.toLowerCase())
  if (known) return known.id
  if (trimmed.toLowerCase().startsWith('0x')) {
    const n = parseInt(trimmed.slice(2), 16)
    return Number.isFinite(n) && n >= 0 && n <= 0xff ? n : null
  }
  const dec = Number(trimmed)
  if (Number.isFinite(dec) && Number.isInteger(dec) && dec >= 0 && dec <= 0xff) return dec
  return null
}

const formatHex = (id: number): string => {
  return `0x${id.toString(16).toUpperCase().padStart(2, '0')}`
}

const FIELD_LABEL = 'min-w-[60px] text-[10px] uppercase tracking-[0.08em] text-text-muted'
