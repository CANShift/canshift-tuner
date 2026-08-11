import type { HexColor, Widget } from '@canshift/core'

import { PanelField, PanelRow } from '@/components/ui/form-field'

const PANEL_LABEL = 'hsl(var(--brand-neutral-600))'
const INPUT_BG = 'hsl(var(--brand-neutral-100))'
const INPUT_BORDER = 'hsl(var(--brand-neutral-300))'

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
      <div
        style={{
          fontSize: 10,
          color: PANEL_LABEL,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
          marginTop: 4,
        }}
      >
        Button colors
      </div>
      <PanelRow>
        <PanelField label="Normal">
          <input
            type="color"
            value={normal}
            style={{
              width: '100%',
              height: 28,
              padding: 2,
              background: INPUT_BG,
              border: `1px solid ${INPUT_BORDER}`,
              cursor: 'pointer',
            }}
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
            style={{
              width: '100%',
              height: 28,
              padding: 2,
              background: INPUT_BG,
              border: `1px solid ${INPUT_BORDER}`,
              cursor: 'pointer',
            }}
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
        <div
          role="alert"
          style={{
            fontSize: 10,
            color: 'hsl(var(--status-danger))',
            marginTop: 4,
            marginBottom: 4,
          }}
        >
          {colorError}
        </div>
      )}
    </>
  )
}
