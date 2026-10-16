import type { Widget } from '@canshift/core'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STRINGS } from '../../strings'
import { useGaugeThresholds } from '../../hooks/useGaugeThresholds'
import { LimitInput } from './LimitInput'

const G = STRINGS.gauges

export interface LimitsFieldProps {
  pageId: string
  widget: Widget
}

type Direction = 'above' | 'below'

const LABELS: Record<Direction, { warning: string; danger: string }> = {
  above: { warning: G.warningAbove, danger: G.dangerAbove },
  below: { warning: G.warningBelow, danger: G.dangerBelow },
}

interface DirectionToggleProps {
  direction: Direction
  onChange: (below: boolean) => void
}

const DirectionToggle = ({ direction, onChange }: DirectionToggleProps) => (
  <ToggleGroup
    type="single"
    value={direction}
    aria-label={G.limits}
    onValueChange={(value) => {
      if (value.length > 0) onChange(value === 'below')
    }}
  >
    <ToggleGroupItem value="above" className="h-9 px-3 text-sm">
      {STRINGS.dash.above}
    </ToggleGroupItem>
    <ToggleGroupItem value="below" className="h-9 px-3 text-sm">
      {STRINGS.dash.below}
    </ToggleGroupItem>
  </ToggleGroup>
)

const LimitsHeading = (props: DirectionToggleProps) => (
  <div className="flex items-center justify-between text-[13px] text-app-muted">
    <span>{G.limitsLine}</span>
    <DirectionToggle {...props} />
  </div>
)

export const LimitsField = ({ pageId, widget }: LimitsFieldProps) => {
  const limits = useGaugeThresholds(pageId, widget)
  if (!limits.editable) return null
  const direction: Direction = limits.below ? 'below' : 'above'
  const shared = { unit: limits.unit }
  return (
    <div className="flex flex-col gap-2">
      <LimitsHeading direction={direction} onChange={limits.setBelow} />
      <LimitInput
        {...shared}
        id={`warn-${widget.id}`}
        label={LABELS[direction].warning}
        hint={G.coloursOrange}
        tone="warning"
        value={limits.warnAt}
        placeholder={G.noLimit}
        onCommit={limits.setWarnAt}
      />
      <LimitInput
        {...shared}
        id={`danger-${widget.id}`}
        label={LABELS[direction].danger}
        hint={G.coloursRed}
        tone="danger"
        value={limits.dangerAt}
        onCommit={limits.setDangerAt}
      />
    </div>
  )
}
