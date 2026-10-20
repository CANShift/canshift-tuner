import {
  WIDGET_TOP_RULE,
  WIDGET_ZONE_COLORS,
  widgetTopRulePx,
  type GaugeSeverity,
} from '@canshift/core'
import { cn } from '@/lib/utils'
import { isPrimaryRule, widgetTopRule } from '../widget-preview.styles'

export interface TopRuleProps {
  devicePx: number
  scale: number
  inkColor: string
  severity?: GaugeSeverity
  blink?: boolean
}

const plainRuleColor = (rulePx: number, inkColor: string): string =>
  isPrimaryRule(rulePx) ? inkColor : WIDGET_TOP_RULE.trackColor

const ruleColor = (rulePx: number, inkColor: string, severity: GaugeSeverity): string =>
  ({
    normal: plainRuleColor(rulePx, inkColor),
    warn: WIDGET_ZONE_COLORS.warning,
    danger: WIDGET_TOP_RULE.dangerColor,
  })[severity]

export const TopRule = ({
  devicePx,
  scale,
  inkColor,
  severity = 'normal',
  blink = false,
}: TopRuleProps) => {
  const rulePx = widgetTopRulePx(Math.round(devicePx))
  return (
    <span
      aria-hidden="true"
      className={cn(widgetTopRule({ blink }))}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ height: rulePx * scale, background: ruleColor(rulePx, inkColor, severity) }}
    />
  )
}
