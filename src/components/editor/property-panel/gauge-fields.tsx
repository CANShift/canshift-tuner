import type { GaugeDisplayStyle, GaugeWidgetConfig, SignalDef, Widget } from '@canshift/core'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  GAUGE_DEFAULT_TOKEN,
  SIZE_TOKENS,
  gaugeTokenIds,
  tokenFromSpans,
} from '../../../utils/size-tokens'
import { ConfigFieldsProps, GAUGE_STYLES } from './shared'
import { PanelField, PanelInput, PanelRow, segmentPill } from '@/components/ui/form-field'
import { withBig, withMax, withMin } from './gauge/gauge-range'

const resetAction = (enabled: boolean, run: () => void): (() => void) | undefined =>
  enabled ? run : undefined

const BIG_CHOICES = [
  { label: 'Auto', big: 0, title: 'Derive from the widget box' },
  { label: 'XL', big: 96, title: 'Hero 96 — device 48' },
  { label: 'L', big: 88, title: 'Hero 88 — device 44' },
  { label: 'M', big: 64, title: 'Primary 64 — device 32' },
  { label: 'S', big: 48, title: 'Mid 48 — device 22' },
  { label: 'XS', big: 34, title: 'Secondary 34 — device 17' },
] as const

interface GaugeFieldProps {
  widget: Widget
  cfg: GaugeWidgetConfig
  onChange: ConfigFieldsProps['onChange']
  signalDef: SignalDef | undefined
}

const StyleField = ({ widget, cfg, onChange }: GaugeFieldProps) => (
  <PanelField label="Style">
    <div className="flex gap-1">
      {GAUGE_STYLES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => {
            const token = SIZE_TOKENS[GAUGE_DEFAULT_TOKEN[value]]
            onChange({
              config: { ...cfg, displayStyle: value },
              layout: { ...widget.layout, colSpan: token.colSpan, rowSpan: token.rowSpan },
            })
          }}
          className={cn(
            segmentPill({ tone: 'blue', active: cfg.displayStyle === value }),
            'uppercase'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  </PanelField>
)

const TypeField = ({ cfg, onChange }: GaugeFieldProps) => (
  <PanelField label="Type">
    <div className="flex gap-1">
      {BIG_CHOICES.map((choice) => (
        <button
          key={choice.label}
          onClick={() => {
            onChange({ config: withBig(cfg, choice.big) })
          }}
          title={choice.title}
          className={cn(segmentPill({ tone: 'green', active: (cfg.big ?? 0) === choice.big }))}
        >
          {choice.label}
        </button>
      ))}
    </div>
  </PanelField>
)

const SizeField = ({ widget, cfg, onChange }: GaugeFieldProps) => {
  const allowedTokenIds = gaugeTokenIds(cfg.displayStyle)
  const activeTokenId =
    tokenFromSpans(widget.layout.colSpan, widget.layout.rowSpan) ?? allowedTokenIds[0] ?? null
  return (
    <PanelField label="Size">
      <div className="flex gap-1">
        {allowedTokenIds.map((tokenId) => {
          const token = SIZE_TOKENS[tokenId]
          return (
            <button
              key={tokenId}
              onClick={() => {
                onChange({
                  layout: { ...widget.layout, colSpan: token.colSpan, rowSpan: token.rowSpan },
                })
              }}
              title={token.description}
              className={cn(segmentPill({ tone: 'green', active: tokenId === activeTokenId }))}
            >
              {token.label}
            </button>
          )
        })}
      </div>
    </PanelField>
  )
}

const MinField = ({ cfg, onChange, signalDef }: GaugeFieldProps) => (
  <PanelField
    label="Min"
    onReset={resetAction(signalDef !== undefined && cfg.minValue !== signalDef.min, () => {
      if (signalDef) onChange({ config: { ...cfg, minValue: signalDef.min } })
    })}
  >
    <PanelInput
      type="number"
      value={cfg.minValue}
      onChange={(e) => {
        onChange({ config: withMin(cfg, Number(e.target.value)) })
      }}
    />
  </PanelField>
)

const MaxField = ({ cfg, onChange, signalDef }: GaugeFieldProps) => (
  <PanelField
    label="Max"
    onReset={resetAction(signalDef !== undefined && cfg.maxValue !== signalDef.max, () => {
      if (signalDef) onChange({ config: { ...cfg, maxValue: signalDef.max } })
    })}
  >
    <PanelInput
      type="number"
      value={cfg.maxValue}
      onChange={(e) => {
        onChange({ config: withMax(cfg, Number(e.target.value)) })
      }}
    />
  </PanelField>
)

const RangeFields = (props: GaugeFieldProps) => (
  <PanelRow>
    <MinField {...props} />
    <MaxField {...props} />
  </PanelRow>
)

const ArcFields = (props: GaugeFieldProps) => (
  <>
    <RangeFields {...props} />
    <PanelField label="Rev flash">
      <Checkbox
        checked={props.cfg.revFlash ?? false}
        onCheckedChange={(checked) => {
          props.onChange({ config: { ...props.cfg, revFlash: checked === true } })
        }}
      />
    </PanelField>
  </>
)

const NumericFields = ({ cfg, onChange }: GaugeFieldProps) => (
  <PanelField label="Value bar">
    <Checkbox
      aria-label="Value bar"
      checked={cfg.showBar ?? false}
      onCheckedChange={(checked) => {
        onChange({ config: { ...cfg, showBar: checked === true } })
      }}
    />
  </PanelField>
)

const STYLE_FIELDS: Record<GaugeDisplayStyle, (props: GaugeFieldProps) => React.JSX.Element> = {
  arc: ArcFields,
  numeric: NumericFields,
}

export const GaugeFields = ({ widget, onChange, signalDef }: ConfigFieldsProps) => {
  if (widget.config.type !== 'gauge') return null
  const props: GaugeFieldProps = { widget, cfg: widget.config, onChange, signalDef }
  const StyleSpecific = STYLE_FIELDS[widget.config.displayStyle]
  return (
    <>
      <StyleField {...props} />
      <TypeField {...props} />
      <SizeField {...props} />
      <StyleSpecific {...props} />
    </>
  )
}
