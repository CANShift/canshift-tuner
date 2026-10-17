import { useState } from 'react'
import type { WheelButtonSignal } from '@canshift/core'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { mappingText, wheelButtonNumber } from '../../lib/car/wheel-buttons'
import {
  useWheelButtons,
  type WheelButtonSlot,
  type WheelButtonsEditor,
} from '../../hooks/useWheelButtons'
import { PressedLight } from './PressedLight'
import { WheelButtonSheet } from './WheelButtonSheet'

const C = STRINGS.car

interface SlotRowProps {
  slot: WheelButtonSlot
  onEdit: (slot: WheelButtonSignal) => void
}

const SlotRow = ({ slot, onEdit }: SlotRowProps) => (
  <li className="flex min-h-[52px] items-center gap-3 border-b border-app-divider px-4 py-2 last:border-b-0">
    <PressedLight pressed={slot.pressed} />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-[15px]">{C.wheelButton(wheelButtonNumber(slot.slot))}</span>
      <span className="truncate font-num text-xs text-app-muted">{mappingText(slot.mapping)}</span>
    </span>
    <Button
      variant="outline"
      size="sm"
      aria-label={`${slot.mapping === null ? C.mapButton : C.changeButton} ${C.wheelButton(wheelButtonNumber(slot.slot))}`}
      onClick={() => {
        onEdit(slot.slot)
      }}
    >
      {slot.mapping === null ? C.mapButton : C.changeButton}
    </Button>
  </li>
)

interface EditingSheetProps {
  editing: WheelButtonSignal | null
  editor: WheelButtonsEditor
  onClose: () => void
}

const EditingSheet = ({ editing, editor, onClose }: EditingSheetProps) => {
  const current = editor.slots.find((slot) => slot.slot === editing)
  if (current === undefined) return null
  return (
    <WheelButtonSheet
      key={current.slot}
      slot={current.slot}
      mapping={current.mapping}
      onClose={onClose}
      onSave={(mapping) => {
        editor.map(current.slot, mapping)
        onClose()
      }}
      onRemove={() => {
        editor.unmap(current.slot)
        onClose()
      }}
    />
  )
}

export const WheelButtonsPanel = ({ editor }: { editor: WheelButtonsEditor }) => {
  const [editing, setEditing] = useState<WheelButtonSignal | null>(null)
  return (
    <section
      aria-label={C.wheelButtons}
      className="overflow-hidden rounded-card border border-app-border bg-app-surface"
    >
      <div className="flex flex-col gap-0.5 border-b border-app-border px-4 py-3">
        <h2 className="text-lg font-bold lg:text-xl">{C.wheelButtons}</h2>
        <span className="text-sm text-app-muted">{C.wheelButtonsHint}</span>
      </div>
      <ul>
        {editor.slots.map((slot) => (
          <SlotRow key={slot.slot} slot={slot} onEdit={setEditing} />
        ))}
      </ul>
      <EditingSheet editing={editing} editor={editor} onClose={() => setEditing(null)} />
    </section>
  )
}

export const WheelButtonsCard = () => <WheelButtonsPanel editor={useWheelButtons()} />
