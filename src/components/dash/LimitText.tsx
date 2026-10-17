import { useEffect, useState } from 'react'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import type { CriticalAlertEditor } from '../../hooks/useCriticalAlert'

const D = STRINGS.dash

const DIRECTION_WORDS = { above: STRINGS.gauges.above, below: STRINGS.gauges.below }

const parsed = (text: string): number | null => {
  const value = Number(text.replace(',', '.'))
  return text.trim().length === 0 || Number.isNaN(value) ? null : value
}

export interface LimitTextProps {
  editor: CriticalAlertEditor
  labelClass: string
  inputId: string
}

const ReadsAs = ({ editor, shown }: { editor: CriticalAlertEditor; shown: string }) => {
  const value = `${shown} ${editor.unit}`.trim()
  const signal = signalName(editor.alert.signal).toLowerCase()
  return (
    <p className="rounded-[8px] bg-[#2a1515] px-3 py-2.5 text-sm">
      {D.readsAs(signal, DIRECTION_WORDS[editor.alert.direction], value)}
    </p>
  )
}

export const LimitText = ({ editor, labelClass, inputId }: LimitTextProps) => {
  const shown = String(editor.shownFiresAt)
  const [text, setText] = useState(shown)
  useEffect(() => setText(shown), [shown])
  return (
    <>
      <div className="flex items-center gap-3">
        <label htmlFor={inputId} className={labelClass}>
          {D.value}
        </label>
        <input
          id={inputId}
          inputMode="decimal"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={() => editor.setFiresAt(parsed(text))}
          className="h-12 min-w-0 flex-1 rounded-control border border-app-border bg-app-bg px-3 text-base lg:h-11"
        />
        <span className="w-8 text-sm text-app-muted">{editor.unit}</span>
      </div>
      <ReadsAs editor={editor} shown={shown} />
    </>
  )
}
