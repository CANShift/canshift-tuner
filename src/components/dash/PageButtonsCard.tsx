import type { PageButtonRole } from '@canshift/core'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { isWheelButton, wheelButtonNumber } from '../../lib/car/wheel-buttons'
import { usePageButtons, type PageButtonsEditor } from '../../hooks/usePageButtons'
import type { WheelButtonSlot } from '../../hooks/useWheelButtons'
import { PressedLight } from '../car/PressedLight'
import { UiIcon } from '../icons/UiIcons'

const D = STRINGS.dash

const NONE = 'none'

const ROLES: readonly PageButtonRole[] = ['next', 'previous']

const ROLE_LABEL: Record<PageButtonRole, string> = {
  next: D.nextPage,
  previous: D.previousPage,
}

const slotLabel = (slot: WheelButtonSlot): string => {
  const name = STRINGS.car.wheelButton(wheelButtonNumber(slot.slot))
  return slot.mapping === null ? D.unmappedSlot(name) : name
}

const CustomSignalOption = ({ signal }: { signal: string | undefined }) => {
  if (signal === undefined || isWheelButton(signal)) return null
  return <SelectItem value={signal}>{signalName(signal)}</SelectItem>
}

interface ButtonRowProps {
  role: PageButtonRole
  editor: PageButtonsEditor
}

const isPressedFor = (editor: PageButtonsEditor, signal: string | undefined): boolean =>
  editor.slots.some((slot) => slot.slot === signal && slot.pressed)

const ButtonSelect = ({ role, editor }: ButtonRowProps) => {
  const signal = editor.signalOf(role)
  return (
    <Select
      value={signal ?? NONE}
      onValueChange={(value) => {
        editor.set(role, value === NONE ? null : value)
      }}
    >
      <SelectTrigger
        aria-label={ROLE_LABEL[role]}
        className="h-12 min-w-0 flex-1 rounded-control border-app-border px-3 text-[15px] lg:h-11"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{D.noButton}</SelectItem>
        {editor.slots.map((slot) => (
          <SelectItem key={slot.slot} value={slot.slot}>
            {slotLabel(slot)}
          </SelectItem>
        ))}
        <CustomSignalOption signal={signal} />
      </SelectContent>
    </Select>
  )
}

const ButtonRow = ({ role, editor }: ButtonRowProps) => (
  <div className="flex items-center gap-3">
    <PressedLight pressed={isPressedFor(editor, editor.signalOf(role))} />
    <span className="w-[92px] shrink-0 text-[15px] lg:w-[110px]">{ROLE_LABEL[role]}</span>
    <ButtonSelect role={role} editor={editor} />
  </div>
)

export const PageButtonsPanel = ({ editor }: { editor: PageButtonsEditor }) => (
  <section
    aria-label={D.pageButtons}
    className="flex flex-col overflow-hidden rounded-card border border-app-border bg-app-surface"
  >
    <div className="flex min-h-11 items-center gap-2.5 border-b border-app-border px-3.5 lg:min-h-12 lg:px-5">
      <UiIcon name="dash" className="text-app-accent" />
      <span className="text-base font-bold lg:text-[17px]">{D.pageButtons}</span>
    </div>
    <div className="flex flex-col gap-3 px-3.5 pb-3 pt-2.5 lg:px-5 lg:pb-5 lg:pt-4">
      <p className="text-[13px] leading-snug text-app-secondary lg:text-sm">{D.pageButtonsHint}</p>
      {ROLES.map((role) => (
        <ButtonRow key={role} role={role} editor={editor} />
      ))}
      <p className="text-xs text-app-muted lg:text-[13px]">{D.tapEdgesHint}</p>
    </div>
  </section>
)

export const PageButtonsCard = () => <PageButtonsPanel editor={usePageButtons()} />
