import type { HexColor, Widget } from '@canshift/core'

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

export const ButtonColorsRow = ({
  widget,
  colorError,
  safeParseHex,
  onChange,
}: ButtonColorsRowProps) => {
  if (widget.type !== 'button' || widget.config.type !== 'button') return null
  const cfg = widget.config
  const normal = cfg.colors?.normal ?? widget.style.primaryColor
  const active = cfg.colors?.active ?? widget.style.primaryColor

  return (
    <>
      <div className={SECTION_LABEL}>Button colors</div>
      <PanelRow>
        <PanelField label="Normal">
          <input
            type="color"
            value={normal}
            className={COLOR_INPUT}
            onChange={(e) => {
              const parsed = safeParseHex(e.target.value)
              if (parsed === null) return
              const next = {
                normal: parsed,
                active: cfg.colors?.active ?? parsed,
              }
              onChange({ config: { ...cfg, colors: next } })
            }}
          />
        </PanelField>
        <PanelField label="Active">
          <input
            type="color"
            value={active}
            className={COLOR_INPUT}
            onChange={(e) => {
              const parsed = safeParseHex(e.target.value)
              if (parsed === null) return
              const next = {
                normal: cfg.colors?.normal ?? parsed,
                active: parsed,
              }
              onChange({ config: { ...cfg, colors: next } })
            }}
          />
        </PanelField>
      </PanelRow>
      {colorError !== null && (
        <div role="alert" className="my-1 text-[10px] text-status-danger">
          {colorError}
        </div>
      )}
    </>
  )
}
