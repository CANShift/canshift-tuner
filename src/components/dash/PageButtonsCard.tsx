import { useState } from 'react'
import type { PageButtonRole } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { isWheelButton, mappingText } from '../../lib/car/wheel-buttons'
import type { PageButtonState } from '../../lib/car/page-buttons'
import { usePageButtons, type PageButtonsEditor } from '../../hooks/usePageButtons'
import { PressedLight } from '../car/PressedLight'
import { UiIcon } from '../icons/UiIcons'
import { WheelButtonSheet } from './WheelButtonSheet'

const C = STRINGS.car
const D = STRINGS.dash

const ROLE_LABEL: Record<PageButtonRole, string> = {
  next: D.nextPage,
  previous: D.previousPage,
}

const describeButton = (button: PageButtonState): string => {
  if (!button.assigned || isWheelButton(button.signal)) return mappingText(button.mapping)
  if (button.mapping === null) return signalName(button.signal)
  return `${signalName(button.signal)} · ${mappingText(button.mapping)}`
}

interface ButtonRowProps {
  button: PageButtonState
  onEdit: (role: PageButtonRole) => void
}

const ButtonRow = ({ button, onEdit }: ButtonRowProps) => {
  const action = button.assigned ? C.changeButton : C.setButton
  return (
    <li className="flex min-h-[52px] items-center gap-3">
      <PressedLight pressed={button.pressed} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[15px]">{ROLE_LABEL[button.role]}</span>
        <span className="truncate font-num text-xs text-app-muted">{describeButton(button)}</span>
      </span>
      <Button
        variant="outline"
        size="sm"
        aria-label={`${action} ${ROLE_LABEL[button.role]}`}
        onClick={() => {
          onEdit(button.role)
        }}
      >
        {action}
      </Button>
    </li>
  )
}

interface EditingSheetProps {
  editing: PageButtonRole | null
  editor: PageButtonsEditor
  onClose: () => void
}

const EditingSheet = ({ editing, editor, onClose }: EditingSheetProps) => {
  const current = editor.buttons.find((button) => button.role === editing)
  if (current === undefined) return null
  return (
    <WheelButtonSheet
      key={current.role}
      title={ROLE_LABEL[current.role]}
      mapping={current.mapping}
      removable={current.assigned}
      onClose={onClose}
      onSave={(mapping) => {
        editor.save(current.role, mapping)
        onClose()
      }}
      onRemove={() => {
        editor.remove(current.role)
        onClose()
      }}
    />
  )
}

export const PageButtonsPanel = ({ editor }: { editor: PageButtonsEditor }) => {
  const [editing, setEditing] = useState<PageButtonRole | null>(null)
  return (
    <section
      aria-label={D.pageButtons}
      className="flex flex-col overflow-hidden rounded-card border border-app-border bg-app-surface"
    >
      <div className="flex min-h-11 items-center gap-2.5 border-b border-app-border px-3.5 lg:min-h-12 lg:px-5">
        <UiIcon name="dash" className="text-app-accent" />
        <span className="text-base font-bold lg:text-[17px]">{D.pageButtons}</span>
      </div>
      <div className="flex flex-col gap-2 px-3.5 pb-3 pt-2.5 lg:px-5 lg:pb-5 lg:pt-4">
        <p className="text-[13px] leading-snug text-app-secondary lg:text-sm lg:leading-5">
          {D.pageButtonsHint}
        </p>
        <ul className="flex flex-col">
          {editor.buttons.map((button) => (
            <ButtonRow key={button.role} button={button} onEdit={setEditing} />
          ))}
        </ul>
        <p className="text-xs text-app-muted lg:text-[13px]">{D.tapEdgesHint}</p>
      </div>
      <EditingSheet editing={editing} editor={editor} onClose={() => setEditing(null)} />
    </section>
  )
}

export const PageButtonsCard = () => <PageButtonsPanel editor={usePageButtons()} />
