import { memo } from 'react'
import { WIDGET_ACCENT_COLOR, WIDGET_MUTED_COLOR } from '@canshift/core'
import { SensorIcon } from '../../icons/SensorIcons'
import { type BaseRendererProps, formatSignalLabel } from './shared'
import { UI_FONT, UI_LABEL_TRACKING, UI_LABEL_WEIGHT } from '../../../lib/typography'

export interface ButtonRendererProps extends BaseRendererProps {
  active: boolean
  cycleStateIndex?: number | undefined
}

const BUTTON_FONT_STEPS = [
  { minTarget: 22, size: 28 },
  { minTarget: 15, size: 16 },
  { minTarget: 13, size: 14 },
  { minTarget: 0, size: 12 },
] as const

const snapButtonFontSize = (target: number): number =>
  BUTTON_FONT_STEPS.find((step) => target >= step.minTarget)?.size ?? 12

export const computeButtonPreviewMetrics = (
  w: number,
  h: number,
  showIcon: boolean
): { iconSize: number; fontSize: number } => {
  const iconSize = showIcon ? Math.max(18, Math.min(h * 0.75, h - 14, w * 0.7, 56)) : 0
  const labelBudget = w - 12
  const verticalBudget = showIcon ? Math.min(h * 0.2, iconSize * 0.4) : h * 0.48
  const target = Math.max(8, Math.min(verticalBudget, labelBudget * 0.22))
  return { iconSize, fontSize: snapButtonFontSize(target) }
}

const KICKER_ENGAGED_COLOR = 'rgba(255,255,255,0.75)'

export const ButtonPreview = memo(function ButtonPreview({
  widget,
  w,
  h,
  active,
  cycleStateIndex,
}: ButtonRendererProps) {
  if (widget.config.type !== 'button') return null
  const cfg = widget.config
  const st = widget.style

  const activeStateIdx = cfg.mode === 'cycle' ? (cycleStateIndex ?? cfg.initialActiveIndex) : null
  const activeState =
    cfg.mode === 'cycle' && activeStateIdx !== null ? cfg.states[activeStateIdx] : null

  const displayLabel = activeState?.label ?? cfg.label
  const displayIconName = activeState?.iconName ?? cfg.iconName ?? null
  const displayColors = activeState?.colors ?? cfg.colors

  const showIcon = cfg.showIcon === true && displayIconName !== null
  const showLabel = cfg.showLabel !== false
  const { iconSize, fontSize } = computeButtonPreviewMetrics(w, h, showIcon)

  const engagedColor = displayColors?.active ?? WIDGET_ACCENT_COLOR
  const idleBorder = displayColors?.normal ?? st.textColor

  const bgColor = active ? engagedColor : 'transparent'
  const borderColor = active ? engagedColor : idleBorder
  const textColor = active ? '#FFFFFF' : st.textColor
  const kickerColor = active ? KICKER_ENGAGED_COLOR : WIDGET_MUTED_COLOR

  const kicker = formatSignalLabel(widget.signal)

  return (
    <div
      style={{
        width: w,
        height: h,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 2,
        padding: '4px 7px',
        boxSizing: 'border-box',
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 0,
        overflow: 'visible',
        transition: 'background 0.1s, border-color 0.1s',
      }}
    >
      {showLabel && kicker !== '' && (
        <span
          style={{
            color: kickerColor,
            fontSize: 10,
            fontFamily: UI_FONT,
            fontWeight: UI_LABEL_WEIGHT,
            letterSpacing: UI_LABEL_TRACKING,
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {kicker.toUpperCase()}
        </span>
      )}
      {showIcon && displayIconName !== null && (
        <div style={{ flexShrink: 0, display: 'flex' }}>
          <SensorIcon name={displayIconName} size={iconSize} color={textColor + 'CC'} />
        </div>
      )}
      {showLabel && (
        <span
          style={{
            color: textColor,
            fontSize,
            fontFamily: UI_FONT,
            fontWeight: 800,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflow: 'visible',
            minWidth: 0,
            textAlign: 'left',
            lineHeight: 1,
          }}
        >
          {displayLabel}
        </span>
      )}
    </div>
  )
})
