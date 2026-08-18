import { memo } from 'react'
import { CONTROL_STEP_MAX, GAUGE_TRACK_COLORS, type ControlState } from '@canshift/core'
import { cn } from '@/lib/utils'
import {
  controlFor,
  controlSurface,
  controlText,
  defaultControlColors,
} from '../../../lib/control-paint'
import { BLINK } from '../widget-preview.styles'
import { type BaseRendererProps, formatSignalLabel } from './shared'

const FRAME = [
  'box-border flex flex-col items-start justify-center gap-0.5 overflow-visible',
  'rounded-none border-2 border-solid px-[7px] py-1',
  '[transition:background_0.1s,border-color_0.1s]',
].join(' ')

const KICKER = 'font-sans text-[10px] font-extrabold uppercase leading-none tracking-[0.18em]'

const LABEL = [
  'min-w-0 overflow-visible whitespace-normal break-words',
  'text-left font-sans font-extrabold leading-none',
].join(' ')

export interface ButtonRendererProps extends BaseRendererProps {
  state: ControlState
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

const SEGMENT_ROW = 'mt-0.5 flex w-full gap-[2px]'
const SEGMENT = 'h-[2px] flex-1'
const DEMO_LEVEL = 3

const SegmentRow = ({ level, lit, unlit }: { level: number; lit: string; unlit: string }) => (
  <span className={SEGMENT_ROW}>
    {Array.from({ length: CONTROL_STEP_MAX }, (_, i) => (
      // eslint-disable-next-line no-inline-style/no-inline-style
      <span key={i} className={SEGMENT} style={{ background: i < level ? lit : unlit }} />
    ))}
  </span>
)

export const ButtonPreview = memo(function ButtonPreview({
  widget,
  w,
  h,
  state,
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

  const control = controlFor(kicker)
  const colors = defaultControlColors(displayColors?.normal ?? st.textColor, displayColors?.active)
  const surface = controlSurface(state, colors)
  const text = control === null ? null : controlText(control, state, displayText)
  const word = text?.word ?? displayText
  const qualifier = text?.qualifier ?? ''
  const stepper = control?.kind === 'stepper'

  return (
    <div
      className={cn(FRAME, surface.pulses && BLINK)}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        width: w,
        height: h,
        background: surface.background,
        borderColor: surface.borderColor,
      }}
    >
      {showLabel && kicker !== '' && (
        <span
          className={KICKER}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ color: surface.kickerColor, opacity: surface.kickerOpacity }}
        >
          {kicker}
          {qualifier !== '' && (
            <>
              <br />
              {qualifier}
            </>
          )}
        </span>
      )}
      {showLabel && (
        <span
          className={LABEL}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ color: surface.wordColor, fontSize }}
        >
          {word}
        </span>
      )}
      {stepper && state !== 'unavailable' && (
        <SegmentRow
          level={state === 'off' ? 0 : DEMO_LEVEL}
          lit={surface.wordColor}
          unlit={GAUGE_TRACK_COLORS.plain}
        />
      )}
    </div>
  )
})
