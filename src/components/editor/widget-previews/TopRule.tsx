import { WIDGET_TOP_RULE, widgetTopRulePx } from '@canshift/core'
import { cn } from '@/lib/utils'
import { ruleTier, widgetTopRule } from '../widget-preview.styles'

export interface TopRuleProps {
  fontSize: number
  inkColor: string
  danger?: boolean
}

const ruleColor = (rulePx: number, inkColor: string, danger: boolean): string => {
  if (danger) return WIDGET_TOP_RULE.dangerColor
  return rulePx === WIDGET_TOP_RULE.primaryPx ? inkColor : WIDGET_TOP_RULE.trackColor
}

export const TopRule = ({ fontSize, inkColor, danger = false }: TopRuleProps) => {
  const rulePx = widgetTopRulePx(Math.round(fontSize))
  return (
    <span
      aria-hidden="true"
      className={cn(widgetTopRule({ tier: ruleTier(rulePx), blink: danger }))}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ background: ruleColor(rulePx, inkColor, danger) }}
    />
  )
}
