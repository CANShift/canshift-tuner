import { Checkbox } from '@/components/ui/checkbox'
import {
  GAUGE_DEFAULT_TOKEN,
  SIZE_TOKENS,
  gaugeTokenIds,
  tokenFromSpans,
} from '../../../utils/size-tokens'
import { ConfigFieldsProps, GAUGE_STYLES } from './shared'
import { PanelField, PanelInput, PanelRow } from '@/components/ui/form-field'

const resetAction = (enabled: boolean, run: () => void): (() => void) | undefined =>
  enabled ? run : undefined

const BIG_CHOICES = [
  { label: 'Auto', big: 0, title: 'Derive from the widget box' },
  { label: 'XL', big: 96, title: 'Hero 96 — device 48' },
  { label: 'L', big: 88, title: 'Hero 88 — device 44' },
  { label: 'M', big: 64, title: 'Primary 64 — device 32' },
  { label: 'S', big: 48, title: 'Mid 48 — device 24' },
  { label: 'XS', big: 34, title: 'Secondary 34 — device 17' },
] as const

export const GaugeFields = ({ widget, onChange, signalDef }: ConfigFieldsProps) => {
  const cfg = widget.config.type === 'gauge' ? widget.config : null
  if (!cfg) return null
  const style = cfg.displayStyle
  const defaultDanger = signalDef?.dangerLevel
  const allowedTokenIds = gaugeTokenIds(style)
  const activeTokenId =
    tokenFromSpans(widget.layout.colSpan, widget.layout.rowSpan) ?? allowedTokenIds[0] ?? null

  return (
    <>
      <PanelField label="Style">
        <div style={{ display: 'flex', gap: 4 }}>
          {GAUGE_STYLES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                const defaultTokenId = GAUGE_DEFAULT_TOKEN[value]
                const defaultToken = SIZE_TOKENS[defaultTokenId]
                onChange({
                  config: { ...cfg, displayStyle: value },
                  layout: {
                    ...widget.layout,
                    colSpan: defaultToken.colSpan,
                    rowSpan: defaultToken.rowSpan,
                  },
                })
              }}
              style={{
                flex: 1,
                padding: '3px 0',
                background:
                  style === value
                    ? 'color-mix(in srgb, #5566AA 14%, transparent)'
                    : 'hsl(var(--brand-neutral-100))',
                border: `1px solid ${style === value ? '#5566AA' : 'hsl(var(--brand-neutral-300))'}`,
                color: style === value ? '#7788CC' : 'hsl(var(--brand-neutral-600))',
                cursor: 'pointer',
                fontSize: 10,
                textTransform: 'uppercase',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </PanelField>

      <PanelField label="Type">
        <div style={{ display: 'flex', gap: 4 }}>
          {BIG_CHOICES.map((choice) => {
            const isActive = (cfg.big ?? 0) === choice.big
            return (
              <button
                key={choice.label}
                onClick={() => {
                  onChange({
                    config:
                      choice.big === 0
                        ? (({ big: _, ...rest }) => rest)(cfg)
                        : { ...cfg, big: choice.big },
                  })
                }}
                title={choice.title}
                style={{
                  flex: 1,
                  padding: '3px 0',
                  background: isActive
                    ? 'color-mix(in srgb, #448844 14%, transparent)'
                    : 'hsl(var(--brand-neutral-100))',
                  border: `1px solid ${isActive ? '#448844' : 'hsl(var(--brand-neutral-300))'}`,
                  color: isActive ? '#66AA66' : 'hsl(var(--brand-neutral-600))',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {choice.label}
              </button>
            )
          })}
        </div>
      </PanelField>

      <PanelField label="Size">
        <div style={{ display: 'flex', gap: 4 }}>
          {allowedTokenIds.map((tokenId) => {
            const token = SIZE_TOKENS[tokenId]
            const isActive = tokenId === activeTokenId
            return (
              <button
                key={tokenId}
                onClick={() => {
                  onChange({
                    layout: { ...widget.layout, colSpan: token.colSpan, rowSpan: token.rowSpan },
                  })
                }}
                title={token.description}
                style={{
                  flex: 1,
                  padding: '3px 0',
                  background: isActive
                    ? 'color-mix(in srgb, #448844 14%, transparent)'
                    : 'hsl(var(--brand-neutral-100))',
                  border: `1px solid ${isActive ? '#448844' : 'hsl(var(--brand-neutral-300))'}`,
                  color: isActive ? '#66AA66' : 'hsl(var(--brand-neutral-600))',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {token.label}
              </button>
            )
          })}
        </div>
      </PanelField>

      {style === 'arc' && (
        <>
          <PanelRow>
            <PanelField
              label="Min"
              onReset={resetAction(
                signalDef !== undefined && cfg.minValue !== signalDef.min,
                () => {
                  if (signalDef) onChange({ config: { ...cfg, minValue: signalDef.min } })
                }
              )}
            >
              <PanelInput
                type="number"
                value={cfg.minValue}
                onChange={(e) => {
                  const newMin = Number(e.target.value)
                  onChange({
                    config: {
                      ...cfg,
                      minValue: newMin,
                      dangerLevel: Math.max(cfg.dangerLevel, newMin),
                    },
                  })
                }}
              />
            </PanelField>
            <PanelField
              label="Max"
              onReset={resetAction(
                signalDef !== undefined && cfg.maxValue !== signalDef.max,
                () => {
                  if (signalDef) onChange({ config: { ...cfg, maxValue: signalDef.max } })
                }
              )}
            >
              <PanelInput
                type="number"
                value={cfg.maxValue}
                onChange={(e) => {
                  const newMax = Number(e.target.value)
                  const range = cfg.maxValue - cfg.minValue || 1
                  const dangerPct = (cfg.dangerLevel - cfg.minValue) / range
                  const newRange = newMax - cfg.minValue || 1
                  onChange({
                    config: {
                      ...cfg,
                      maxValue: newMax,
                      dangerLevel: Math.round(cfg.minValue + dangerPct * newRange),
                    },
                  })
                }}
              />
            </PanelField>
          </PanelRow>
          <PanelRow>
            <PanelField
              label="Danger"
              onReset={resetAction(
                defaultDanger !== undefined && cfg.dangerLevel !== defaultDanger,
                () => {
                  if (defaultDanger !== undefined) {
                    onChange({ config: { ...cfg, dangerLevel: defaultDanger } })
                  }
                }
              )}
            >
              <PanelInput
                type="number"
                value={cfg.dangerLevel}
                onChange={(e) => {
                  onChange({ config: { ...cfg, dangerLevel: Number(e.target.value) } })
                }}
              />
            </PanelField>
          </PanelRow>
          <PanelField label="Rev flash">
            <Checkbox
              checked={cfg.revFlash ?? false}
              onCheckedChange={(checked) => {
                onChange({ config: { ...cfg, revFlash: checked === true } })
              }}
            />
          </PanelField>
          <PanelRow>
            <PanelField
              label="Alert at"
              onReset={resetAction(cfg.alertThreshold !== undefined, () => {
                const { alertThreshold: _drop, ...rest } = cfg
                void _drop
                onChange({ config: rest })
              })}
            >
              <PanelInput
                type="number"
                placeholder="off"
                value={cfg.alertThreshold ?? ''}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw === '') {
                    const { alertThreshold: _drop, ...rest } = cfg
                    void _drop
                    onChange({ config: rest })
                    return
                  }
                  const v = Number(raw)
                  if (!Number.isFinite(v)) return
                  onChange({ config: { ...cfg, alertThreshold: v } })
                }}
              />
            </PanelField>
          </PanelRow>
        </>
      )}
      {style === 'numeric' && (
        <PanelField label="Value bar">
          <Checkbox
            aria-label="Value bar"
            checked={cfg.showBar ?? false}
            onCheckedChange={(checked) => {
              onChange({ config: { ...cfg, showBar: checked === true } })
            }}
          />
        </PanelField>
      )}
    </>
  )
}
