import { useState } from 'react'
import type { PageButtonRole } from '@canshift/core'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { usePageButtons, type PageButtonsEditor } from '../../hooks/usePageButtons'
import { UiIcon } from '../icons/UiIcons'
import { SignalPicker } from '../gauges/SignalPicker'

const D = STRINGS.dash

const ROLES: readonly PageButtonRole[] = ['next', 'previous']

const ROLE_LABEL: Record<PageButtonRole, string> = {
  next: D.nextPage,
  previous: D.previousPage,
}

const LABEL = 'w-[92px] shrink-0 text-[15px] lg:w-[110px]'

interface ButtonRowProps {
  role: PageButtonRole
  editor: PageButtonsEditor
}

const ClearButton = ({ role, editor }: ButtonRowProps) => (
  <button
    type="button"
    aria-label={D.clearButton(ROLE_LABEL[role])}
    onClick={() => {
      editor.set(role, null)
    }}
    className="flex size-12 items-center justify-center rounded-control border border-app-border bg-app-bg text-app-muted lg:size-11"
  >
    <UiIcon name="trash" />
  </button>
)

const ButtonRow = ({ role, editor }: ButtonRowProps) => {
  const [open, setOpen] = useState(false)
  const signal = editor.signalOf(role)
  return (
    <div className="flex items-center gap-3">
      <span className={LABEL}>{ROLE_LABEL[role]}</span>
      <button
        type="button"
        aria-label={ROLE_LABEL[role]}
        onClick={() => {
          setOpen(true)
        }}
        className="flex h-12 min-w-0 flex-1 items-center justify-between rounded-control border border-app-border bg-app-bg px-3 text-[15px] lg:h-11"
      >
        <span className="truncate">{signal === undefined ? D.noButton : signalName(signal)}</span>
        <UiIcon name="chevronDown" className="text-app-muted" />
      </button>
      {signal !== undefined && <ClearButton role={role} editor={editor} />}
      <SignalPicker
        open={open}
        current={signal ?? ''}
        onOpenChange={setOpen}
        onPick={(picked) => {
          editor.set(role, picked)
        }}
      />
    </div>
  )
}

export const PageButtonsPanel = ({ editor }: { editor: PageButtonsEditor }) => (
  <section
    aria-label={D.pageButtons}
    className="flex flex-col gap-3 rounded-card border border-app-border bg-app-surface px-3.5 py-3 lg:px-5 lg:py-4"
  >
    <div className="flex flex-col gap-0.5">
      <span className="text-[15px] font-bold">{D.pageButtons}</span>
      <span className="text-xs text-app-muted lg:text-[13px]">{D.pageButtonsHint}</span>
    </div>
    {ROLES.map((role) => (
      <ButtonRow key={role} role={role} editor={editor} />
    ))}
    <p className="text-xs text-app-muted lg:text-[13px]">{D.tapEdgesHint}</p>
  </section>
)

export const PageButtonsCard = () => <PageButtonsPanel editor={usePageButtons()} />
