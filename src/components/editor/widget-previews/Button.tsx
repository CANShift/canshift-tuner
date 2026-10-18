import { memo } from 'react'
import {
  CONTROL_STEP_MAX,
  GAUGE_TRACK_COLORS,
  type ButtonWidgetConfig,
  type ControlState,
  type Widget,
} from '@canshift/core'
import { cn } from '@/lib/utils'
import {
  controlFor,
  controlSurface,
  controlText,
  defaultControlColors,
  type ControlSurface,
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

const computeButtonPreviewMetrics = (
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

interface KickerSource {
  mode: string
  kicker?: string
  actions?: { type: string }[]
  states?: { action: { type: string } }[]
}

const actionTypeOf = (cfg: KickerSource): string | undefined =>
  cfg.mode === 'cycle' ? cfg.states?.[0]?.action.type : cfg.actions?.[0]?.type

const kickerFromConfig = (config: { mode: string }, signal: string): string => {
  const cfg = config as KickerSource
  if (cfg.kicker !== undefined && cfg.kicker !== '') return cfg.kicker.toUpperCase()
  const fromSignal = formatSignalLabel(signal)
  if (fromSignal !== '') return fromSignal.toUpperCase()
  const actionType = actionTypeOf(cfg)
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

interface ButtonPaint {
  kicker: string
  qualifier: string
  word: string
  fontSize: number
  surface: ControlSurface
  stepper: boolean
}

const activeStateOf = (cfg: ButtonWidgetConfig, cycleStateIndex: number | undefined) => {
  if (cfg.mode !== 'cycle') return null
  return cfg.states[cycleStateIndex ?? cfg.initialActiveIndex] ?? null
}

const displayOf = (
  widget: Widget,
  cfg: ButtonWidgetConfig,
  cycleStateIndex: number | undefined
) => {
  const activeState = activeStateOf(cfg, cycleStateIndex)
  const colors = activeState?.colors ?? cfg.colors
  return {
    text: (activeState?.label ?? cfg.label).toUpperCase(),
    colors: defaultControlColors(colors?.normal ?? widget.style.textColor, colors?.active),
  }
}

const wordsOf = (kicker: string, state: ControlState, displayText: string) => {
  const control = controlFor(kicker)
  const text = control === null ? null : controlText(control, state, displayText)
  return {
    qualifier: text?.qualifier ?? '',
    word: text?.word ?? displayText,
    stepper: control?.kind === 'stepper',
  }
}

const buttonPaint = (
  widget: Widget,
  cfg: ButtonWidgetConfig,
  props: ButtonRendererProps
): ButtonPaint => {
  const display = displayOf(widget, cfg, props.cycleStateIndex)
  const kicker = kickerFromConfig(cfg, widget.signal)
  const { fontSize } = computeButtonPreviewMetrics(
    props.w,
    props.h,
    kicker !== '',
    display.text.length
  )
  return {
    kicker,
    fontSize,
    surface: controlSurface(props.state, display.colors),
    ...wordsOf(kicker, props.state, display.text),
  }
}

const ButtonKicker = ({ paint }: { paint: ButtonPaint }) => (
  <span
    className={KICKER}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ color: paint.surface.kickerColor, opacity: paint.surface.kickerOpacity }}
  >
    {paint.kicker}
    {paint.qualifier !== '' && (
      <>
        <br />
        {paint.qualifier}
      </>
    )}
  </span>
)

const ButtonWord = ({ paint }: { paint: ButtonPaint }) => (
  <span
    className={LABEL}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ color: paint.surface.wordColor, fontSize: paint.fontSize }}
  >
    {paint.word}
  </span>
)

const ButtonBody = ({
  paint,
  showLabel,
  state,
}: {
  paint: ButtonPaint
  showLabel: boolean
  state: ControlState
}) => (
  <>
    {showLabel && paint.kicker !== '' && <ButtonKicker paint={paint} />}
    {showLabel && <ButtonWord paint={paint} />}
    {paint.stepper && state !== 'unavailable' && (
      <SegmentRow
        level={state === 'off' ? 0 : DEMO_LEVEL}
        lit={paint.surface.wordColor}
        unlit={GAUGE_TRACK_COLORS.plain}
      />
    )}
  </>
)

export const ButtonPreview = memo(function ButtonPreview(props: ButtonRendererProps) {
  const { widget, w, h, state } = props
  if (widget.config.type !== 'button') return null
  const paint = buttonPaint(widget, widget.config, props)
  return (
    <div
      className={cn(FRAME, paint.surface.pulses && BLINK)}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{
        width: w,
        height: h,
        background: paint.surface.background,
        borderColor: paint.surface.borderColor,
      }}
    >
      <ButtonBody paint={paint} showLabel={widget.config.showLabel !== false} state={state} />
    </div>
  )
})
