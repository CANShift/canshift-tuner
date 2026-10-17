import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { STRINGS } from '../../strings'
import { formatFrameIdHex, parseHexFrameId } from '../../utils/frame-id'
import {
  WHEEL_BUTTON_BITS,
  WHEEL_BUTTON_BYTES,
  type WheelButtonMapping,
} from '../../lib/car/wheel-buttons'

const C = STRINGS.car

const WHOLE_BYTE = 'whole'
const FIELD = 'flex flex-col gap-1.5 text-[15px]'
const TRIGGER = 'h-12 rounded-control border-app-border px-3 text-[15px] lg:h-11'

export interface WheelButtonSheetProps {
  title: string
  mapping: WheelButtonMapping | null
  removable: boolean
  onClose: () => void
  onSave: (mapping: WheelButtonMapping) => void
  onRemove: () => void
}

interface Draft {
  frameText: string
  byte: number
  bit: number | null
}

const draftOf = (mapping: WheelButtonMapping | null): Draft => ({
  frameText: mapping === null ? '' : formatFrameIdHex(mapping.frameId),
  byte: mapping?.byte ?? 0,
  bit: mapping?.bit ?? 0,
})

const FrameField = ({ draft, onDraft }: { draft: Draft; onDraft: (d: Draft) => void }) => {
  const invalid = draft.frameText.length > 0 && parseHexFrameId(draft.frameText) < 0
  return (
    <label className={FIELD}>
      {C.frameId}
      <Input
        value={draft.frameText}
        placeholder="0x1A0"
        aria-invalid={invalid}
        onChange={(event) => {
          onDraft({ ...draft, frameText: event.target.value })
        }}
      />
      <span className="text-xs text-app-muted">{invalid ? C.frameIdInvalid : C.frameIdHint}</span>
    </label>
  )
}

const ByteField = ({ draft, onDraft }: { draft: Draft; onDraft: (d: Draft) => void }) => (
  <div className={FIELD}>
    {C.byteLabel}
    <Select
      value={String(draft.byte)}
      onValueChange={(value) => {
        onDraft({ ...draft, byte: Number(value) })
      }}
    >
      <SelectTrigger aria-label={C.byteLabel} className={TRIGGER}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {WHEEL_BUTTON_BYTES.map((byte) => (
          <SelectItem key={byte} value={String(byte)}>
            {C.byteN(byte)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

const BitField = ({ draft, onDraft }: { draft: Draft; onDraft: (d: Draft) => void }) => (
  <div className={FIELD}>
    {C.bitLabel}
    <Select
      value={draft.bit === null ? WHOLE_BYTE : String(draft.bit)}
      onValueChange={(value) => {
        onDraft({ ...draft, bit: value === WHOLE_BYTE ? null : Number(value) })
      }}
    >
      <SelectTrigger aria-label={C.bitLabel} className={TRIGGER}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={WHOLE_BYTE}>{C.wholeByte}</SelectItem>
        {WHEEL_BUTTON_BITS.map((bit) => (
          <SelectItem key={bit} value={String(bit)}>
            {C.bitN(bit)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

const SheetActions = ({ draft, props }: { draft: Draft; props: WheelButtonSheetProps }) => {
  const frameId = parseHexFrameId(draft.frameText)
  return (
    <div className="flex gap-3">
      <Button
        disabled={frameId < 0}
        onClick={() => {
          props.onSave({ frameId, byte: draft.byte, bit: draft.bit })
        }}
      >
        {C.saveButton}
      </Button>
      {props.removable && (
        <Button variant="outline" onClick={props.onRemove}>
          {C.removeButton}
        </Button>
      )}
    </div>
  )
}

export const WheelButtonSheet = (props: WheelButtonSheetProps) => {
  const [draft, setDraft] = useState(() => draftOf(props.mapping))
  return (
    <Sheet open onOpenChange={(open) => !open && props.onClose()}>
      <SheetContent className="gap-4">
        <SheetTitle className="text-xl font-bold">{props.title}</SheetTitle>
        <SheetDescription className="text-[13px] text-app-muted">
          {STRINGS.dash.buttonSheetHint}
        </SheetDescription>
        <FrameField draft={draft} onDraft={setDraft} />
        <div className="grid grid-cols-2 gap-3">
          <ByteField draft={draft} onDraft={setDraft} />
          <BitField draft={draft} onDraft={setDraft} />
        </div>
        <SheetActions draft={draft} props={props} />
      </SheetContent>
    </Sheet>
  )
}
