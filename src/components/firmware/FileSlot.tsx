import { useRef, type RefObject } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { STRINGS } from '../../strings'
import { UiIcon } from '../icons/UiIcons'

export interface FileSlotProps {
  label: string
  extension: string
  chosen: string | null
  onChoose: (file: File) => void
}

interface HiddenPickerProps {
  inputRef: RefObject<HTMLInputElement | null>
  extension: string
  label: string
  onChoose: (file: File) => void
}

const HiddenPicker = ({ inputRef, extension, label, onChoose }: HiddenPickerProps) => (
  <input
    ref={inputRef}
    type="file"
    accept={extension}
    className="hidden"
    aria-label={label}
    onChange={(event) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (file !== undefined) onChoose(file)
    }}
  />
)

export const FileSlot = ({ label, extension, chosen, onChoose }: FileSlotProps) => {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div
      className={cn(
        'flex min-h-16 items-center gap-3 rounded-[12px] border px-3.5 py-2',
        chosen === null ? 'border-dashed border-[#3a3f46]' : 'border-app-border bg-app-surface'
      )}
    >
      <UiIcon name="file" className={chosen === null ? 'text-app-muted' : 'text-app-success'} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[15px] wrap-anywhere">{chosen ?? label}</span>
        <span className="text-[13px] text-app-muted">
          {chosen === null ? STRINGS.firmware.notChosen(extension) : label}
        </span>
      </div>
      <Button variant="secondary" onClick={() => input.current?.click()}>
        {STRINGS.firmware.chooseFile}
      </Button>
      <HiddenPicker inputRef={input} extension={extension} label={label} onChoose={onChoose} />
    </div>
  )
}
