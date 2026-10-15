import {
  WIDGET_TOP_RULE,
  WIDGET_ZONE_COLORS,
  widgetTopRulePx,
  type GaugeSeverity,
} from '@canshift/core'
import { cn } from '@/lib/utils'
import { ruleTier, widgetTopRule } from '../widget-preview.styles'

export interface TopRuleProps {
  fontSize: number
  inkColor: string
  severity?: GaugeSeverity
  blink?: boolean
}

const plainRuleColor = (rulePx: number, inkColor: string): string =>
  rulePx === WIDGET_TOP_RULE.primaryPx ? inkColor : WIDGET_TOP_RULE.trackColor

const ruleColor = (rulePx: number, inkColor: string, severity: GaugeSeverity): string =>
  ({
    normal: plainRuleColor(rulePx, inkColor),
    warn: WIDGET_ZONE_COLORS.warning,
    danger: WIDGET_TOP_RULE.dangerColor,
  })[severity]

export const TopRule = ({
  fontSize,
  inkColor,
  severity = 'normal',
  blink = false,
}: TopRuleProps) => {
  const rulePx = widgetTopRulePx(Math.round(fontSize))
  return (
    <span
      aria-hidden="true"
      className={cn(widgetTopRule({ tier: ruleTier(rulePx), blink }))}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ background: ruleColor(rulePx, inkColor, severity) }}
    />
  )
}
