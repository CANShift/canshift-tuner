import type { ButtonWidgetConfig, HexColor, Widget } from '@canshift/core'

import { PanelField, PanelRow } from '@/components/ui/form-field'

const SECTION_LABEL = 'mb-1.5 mt-1 text-[10px] uppercase tracking-[0.06em] text-brand-neutral-600'

const COLOR_INPUT = [
  'h-7 w-full cursor-pointer border border-solid border-brand-neutral-300',
  'bg-brand-neutral-100 p-0.5',
].join(' ')

interface ButtonColorsRowProps {
  widget: Widget
  colorError: string | null
  safeParseHex: (raw: string) => HexColor | null
  onChange: (patch: Partial<Widget>) => void
}

type ColorRole = 'normal' | 'active'

const COLOR_ROLES: readonly { role: ColorRole; label: string }[] = [
  { role: 'normal', label: 'Normal' },
  { role: 'active', label: 'Active' },
]

interface ColorInputProps {
  label: string
  value: string
  onPick: (raw: string) => void
}

const ColorInput = ({ label, value, onPick }: ColorInputProps) => (
  <PanelField label={label}>
    <input
      type="color"
      value={value}
      className={COLOR_INPUT}
      onChange={(e) => {
        onPick(e.target.value)
      }}
    />
  </PanelField>
)

const colorsWith = (cfg: ButtonWidgetConfig, role: ColorRole, color: HexColor) => ({
  normal: cfg.colors?.normal ?? color,
  active: cfg.colors?.active ?? color,
  [role]: color,
})

const ColorError = ({ message }: { message: string | null }) =>
  message === null ? null : (
    <div role="alert" className="my-1 text-[10px] text-status-danger">
      {message}
    </div>
  )

export const ButtonColorsRow = ({
  widget,
  colorError,
  safeParseHex,
  onChange,
}: ButtonColorsRowProps) => {
  if (widget.type !== 'button' || widget.config.type !== 'button') return null
  const cfg = widget.config
  const pick = (role: ColorRole) => (raw: string) => {
    const parsed = safeParseHex(raw)
    if (parsed !== null) onChange({ config: { ...cfg, colors: colorsWith(cfg, role, parsed) } })
  }
  return (
    <>
      <div className={SECTION_LABEL}>Button colors</div>
      <PanelRow>
        {COLOR_ROLES.map(({ role, label }) => (
          <ColorInput
            key={role}
            label={label}
            value={cfg.colors?.[role] ?? widget.style.primaryColor}
            onPick={pick(role)}
          />
        ))}
      </PanelRow>
      <ColorError message={colorError} />
    </>
  )
}
