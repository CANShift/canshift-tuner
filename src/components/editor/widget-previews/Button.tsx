import { memo } from 'react'
import { WIDGET_ACCENT_COLOR, WIDGET_MUTED_COLOR } from '@canshift/core'
import { type BaseRendererProps, formatSignalLabel } from './shared'
import { UI_FONT, UI_LABEL_TRACKING, UI_LABEL_WEIGHT } from '../../../lib/typography'

export interface ButtonRendererProps extends BaseRendererProps {
  active: boolean
  cycleStateIndex?: number | undefined
}

const BUTTON_FONT_STEPS = [
  { minTarget: 27, size: 28 },
  { minTarget: 15, size: 16 },
  { minTarget: 13, size: 14 },
  { minTarget: 0, size: 12 },
] as const

const KICKER_BAND_PX = 24
const GLYPH_WIDTH_RATIO = 0.65

const snapButtonFontSize = (target: number): number =>
  BUTTON_FONT_STEPS.find((step) => target >= step.minTarget)?.size ?? 12

export const computeButtonPreviewMetrics = (
  w: number,
  h: number,
  hasKicker: boolean,
  labelLen: number
): { fontSize: number } => {
  const labelBudget = w - 14
  const verticalBudget = h - (hasKicker ? KICKER_BAND_PX : 12)
  const widthCap = labelBudget / (Math.max(labelLen, 1) * GLYPH_WIDTH_RATIO)
  const target = Math.max(8, Math.min(verticalBudget, widthCap))
  return { fontSize: snapButtonFontSize(target) }
}

const KICKER_BY_ACTION_TYPE: Record<string, string> = {
  navigate: 'PAGE',
  map_switch: 'MAP',
  cruise_control: 'CRUISE',
}

const kickerFromConfig = (cfg: { mode: string }, signal: string): string => {
  const anyCfg = cfg as {
    mode: string
    kicker?: string
    actions?: { type: string }[]
    states?: { action: { type: string } }[]
  }
  if (anyCfg.kicker !== undefined && anyCfg.kicker !== '') return anyCfg.kicker.toUpperCase()
  const fromSignal = formatSignalLabel(signal)
  if (fromSignal !== '') return fromSignal.toUpperCase()
  const actionType =
    anyCfg.mode === 'cycle' ? anyCfg.states?.[0]?.action.type : anyCfg.actions?.[0]?.type
  return actionType !== undefined ? (KICKER_BY_ACTION_TYPE[actionType] ?? '') : ''
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
  const displayColors = activeState?.colors ?? cfg.colors

  const displayText = displayLabel.toUpperCase()
  const kicker = kickerFromConfig(cfg, widget.signal)
  const showLabel = cfg.showLabel !== false
  const { fontSize } = computeButtonPreviewMetrics(w, h, kicker !== '', displayText.length)

  const engagedColor = displayColors?.active ?? WIDGET_ACCENT_COLOR
  const idleBorder = displayColors?.normal ?? st.textColor

  const bgColor = active ? engagedColor : 'transparent'
  const borderColor = active ? engagedColor : idleBorder
  const textColor = active ? '#FFFFFF' : st.textColor
  const kickerColor = active ? KICKER_ENGAGED_COLOR : WIDGET_MUTED_COLOR

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
          {kicker}
        </span>
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
          {displayText}
        </span>
      )}
    </div>
  )
})
