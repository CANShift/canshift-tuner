import { useState, type ReactNode } from 'react'
import {
  BOARD_ID_MAX_LEN,
  BOARD_NAME_MAX_LEN,
  CAN_CONTROLLERS,
  CHIP_FAMILIES,
  LCD_DRIVERS,
  TOUCH_DRIVERS,
  type BacklightProfile,
  type BoardProfile,
  type CanController,
  type CanProfile,
  type ChipFamily,
  type ConnectivityProfile,
  type LcdDriver,
  type LcdProfile,
  type StorageProfile,
  type TouchDriver,
  type TouchProfile,
} from '@canshift/core'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { blankBoardDraft } from '../../lib/board-profile'
import { useBoardConfigStore } from '../../stores/board-config/board-config.store'

type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T]
type BoolKeys<T> = { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T]

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="grid gap-2 border border-border p-3">
    <legend className="px-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
      {title}
    </legend>
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
  </fieldset>
)

const NumberField = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) => (
  <label className="grid gap-1 text-xs">
    <span className="text-text-muted">{label}</span>
    <Input
      type="number"
      value={String(value)}
      onChange={(e) => {
        const next = Number(e.target.value)
        onChange(Number.isNaN(next) ? 0 : next)
      }}
    />
  </label>
)

const TextField = ({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string
  value: string
  maxLength: number
  onChange: (value: string) => void
}) => (
  <label className="grid gap-1 text-xs">
    <span className="text-text-muted">{label}</span>
    <Input
      value={value}
      maxLength={maxLength}
      onChange={(e) => {
        onChange(e.target.value)
      }}
    />
  </label>
)

const BoolField = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) => (
  <label className="flex items-center justify-between gap-3 text-xs">
    <span className="text-text-muted">{label}</span>
    <Switch checked={value} onCheckedChange={onChange} />
  </label>
)

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) => (
  <label className="grid gap-1 text-xs">
    <span className="text-text-muted">{label}</span>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </label>
)

export const CustomBoardBuilder = () => {
  const saveCustom = useBoardConfigStore((s) => s.saveCustom)
  const [draft, setDraft] = useState<BoardProfile>(blankBoardDraft)
  const [issues, setIssues] = useState<string[]>([])

  const patch = (p: Partial<BoardProfile>) => {
    setDraft((d) => ({ ...d, ...p }))
  }
  const patchLcd = (p: Partial<LcdProfile>) => {
    setDraft((d) => ({ ...d, lcd: { ...d.lcd, ...p } }))
  }
  const patchBacklight = (p: Partial<BacklightProfile>) => {
    setDraft((d) => ({ ...d, backlight: { ...d.backlight, ...p } }))
  }
  const patchTouch = (p: Partial<TouchProfile>) => {
    setDraft((d) => ({ ...d, touch: { ...d.touch, ...p } }))
  }
  const patchCan = (p: Partial<CanProfile>) => {
    setDraft((d) => ({ ...d, can: { ...d.can, ...p } }))
  }
  const patchStorage = (p: Partial<StorageProfile>) => {
    setDraft((d) => ({ ...d, storage: { ...d.storage, ...p } }))
  }
  const patchConn = (p: Partial<ConnectivityProfile>) => {
    setDraft((d) => ({ ...d, conn: { ...d.conn, ...p } }))
  }

  const lcdNum = (key: NumericKeys<LcdProfile>, label: string) => (
    <NumberField
      key={key}
      label={label}
      value={draft.lcd[key]}
      onChange={(v) => {
        patchLcd({ [key]: v } as Partial<LcdProfile>)
      }}
    />
  )
  const lcdBool = (key: BoolKeys<LcdProfile>, label: string) => (
    <BoolField
      key={key}
      label={label}
      value={draft.lcd[key]}
      onChange={(v) => {
        patchLcd({ [key]: v } as Partial<LcdProfile>)
      }}
    />
  )
  const touchNum = (key: NumericKeys<TouchProfile>, label: string) => (
    <NumberField
      key={key}
      label={label}
      value={draft.touch[key]}
      onChange={(v) => {
        patchTouch({ [key]: v } as Partial<TouchProfile>)
      }}
    />
  )

  const handleSave = () => {
    const result = saveCustom(draft.boardName, draft)
    if (result.ok) {
      setIssues([])
      setDraft(blankBoardDraft())
      return
    }
    setIssues(result.issues)
  }

  return (
    <div className="grid gap-4">
      <Section title="Identity">
        <TextField
          label="Board id"
          value={draft.boardId}
          maxLength={BOARD_ID_MAX_LEN}
          onChange={(v) => {
            patch({ boardId: v })
          }}
        />
        <TextField
          label="Board name"
          value={draft.boardName}
          maxLength={BOARD_NAME_MAX_LEN}
          onChange={(v) => {
            patch({ boardName: v })
          }}
        />
        <SelectField
          label="Chip family"
          value={draft.chipFamily}
          options={CHIP_FAMILIES}
          onChange={(v) => {
            patch({ chipFamily: v as ChipFamily })
          }}
        />
      </Section>

      <Section title="LCD">
        <SelectField
          label="Driver"
          value={draft.lcd.driver}
          options={LCD_DRIVERS}
          onChange={(v) => {
            patchLcd({ driver: v as LcdDriver })
          }}
        />
        {lcdNum('pinMosi', 'MOSI')}
        {lcdNum('pinMiso', 'MISO')}
        {lcdNum('pinSclk', 'SCLK')}
        {lcdNum('pinCs', 'CS')}
        {lcdNum('pinDc', 'DC')}
        {lcdNum('pinRst', 'RST')}
        {lcdNum('pinBl', 'Backlight pin')}
        {lcdNum('freqWriteHz', 'Write freq (Hz)')}
        {lcdNum('panelWidth', 'Panel width')}
        {lcdNum('panelHeight', 'Panel height')}
        {lcdNum('memoryWidth', 'Memory width')}
        {lcdNum('memoryHeight', 'Memory height')}
        {lcdNum('defaultRotation', 'Rotation')}
        {lcdNum('colorDepth', 'Color depth')}
        {lcdBool('rgbOrderBgr', 'BGR order')}
        {lcdBool('invert', 'Invert')}
        {lcdBool('busSharedWithTouch', 'Bus shared with touch')}
        {lcdBool('readable', 'Readable')}
      </Section>

      <Section title="Backlight">
        <BoolField
          label="Present"
          value={draft.backlight.present}
          onChange={(v) => {
            patchBacklight({ present: v })
          }}
        />
        <BoolField
          label="Invert"
          value={draft.backlight.invert}
          onChange={(v) => {
            patchBacklight({ invert: v })
          }}
        />
        <NumberField
          label="PWM channel"
          value={draft.backlight.pwmChannel}
          onChange={(v) => {
            patchBacklight({ pwmChannel: v })
          }}
        />
        <NumberField
          label="PWM freq (Hz)"
          value={draft.backlight.pwmFreqHz}
          onChange={(v) => {
            patchBacklight({ pwmFreqHz: v })
          }}
        />
        <NumberField
          label="Default duty"
          value={draft.backlight.defaultDuty}
          onChange={(v) => {
            patchBacklight({ defaultDuty: v })
          }}
        />
      </Section>

      <Section title="Touch">
        <SelectField
          label="Driver"
          value={draft.touch.driver}
          options={TOUCH_DRIVERS}
          onChange={(v) => {
            patchTouch({ driver: v as TouchDriver })
          }}
        />
        {touchNum('pinCs', 'CS')}
        {touchNum('pinIrq', 'IRQ')}
        {touchNum('pinSda', 'SDA')}
        {touchNum('pinScl', 'SCL')}
        {touchNum('freqHz', 'Freq (Hz)')}
        <BoolField
          label="Needs calibration"
          value={draft.touch.needsCalibration}
          onChange={(v) => {
            patchTouch({ needsCalibration: v })
          }}
        />
      </Section>

      <Section title="CAN">
        <SelectField
          label="Controller"
          value={draft.can.controller}
          options={CAN_CONTROLLERS}
          onChange={(v) => {
            patchCan({ controller: v as CanController })
          }}
        />
        <NumberField
          label="TX pin"
          value={draft.can.pinTx}
          onChange={(v) => {
            patchCan({ pinTx: v })
          }}
        />
        <NumberField
          label="RX pin"
          value={draft.can.pinRx}
          onChange={(v) => {
            patchCan({ pinRx: v })
          }}
        />
        <NumberField
          label="Default speed (kbps)"
          value={draft.can.defaultSpeedKbps}
          onChange={(v) => {
            patchCan({ defaultSpeedKbps: v })
          }}
        />
      </Section>

      <Section title="Storage">
        <BoolField
          label="SPIFFS present"
          value={draft.storage.spiffsPresent}
          onChange={(v) => {
            patchStorage({ spiffsPresent: v })
          }}
        />
        <NumberField
          label="SPIFFS size (KB)"
          value={draft.storage.spiffsSizeKb}
          onChange={(v) => {
            patchStorage({ spiffsSizeKb: v })
          }}
        />
        <BoolField
          label="SD present"
          value={draft.storage.sdPresent}
          onChange={(v) => {
            patchStorage({ sdPresent: v })
          }}
        />
        <NumberField
          label="SD CS pin"
          value={draft.storage.sdPinCs}
          onChange={(v) => {
            patchStorage({ sdPinCs: v })
          }}
        />
      </Section>

      <Section title="Connectivity">
        <BoolField
          label="Wi-Fi supported"
          value={draft.conn.wifiSupported}
          onChange={(v) => {
            patchConn({ wifiSupported: v })
          }}
        />
        <BoolField
          label="BLE supported"
          value={draft.conn.bleSupported}
          onChange={(v) => {
            patchConn({ bleSupported: v })
          }}
        />
        <BoolField
          label="PSRAM present"
          value={draft.conn.psramPresent}
          onChange={(v) => {
            patchConn({ psramPresent: v })
          }}
        />
      </Section>

      {issues.length > 0 && (
        <div role="alert" className="grid gap-1 border border-brand-accent p-3 text-xs text-text">
          <span className="font-semibold">This board profile isn’t valid yet:</span>
          {issues.map((issue) => (
            <span key={issue} className="text-text-muted">
              {issue}
            </span>
          ))}
        </div>
      )}

      <div>
        <Button onClick={handleSave}>Save custom board</Button>
      </div>
    </div>
  )
}
