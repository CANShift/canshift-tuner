import {
  CONTROL_KICKER_ENGAGED_OPACITY,
  CONTROL_PAINT,
  CONTROL_STATES,
  WIDGET_ACCENT_COLOR,
  WIDGET_DIM_COLORS,
  WIDGET_LOCK_INK_COLORS,
  WIDGET_LOCK_LINE_COLORS,
  controlByKicker,
  fillParam,
  supportsArmed,
  type ControlDefinition,
  type ControlState,
  type ControlTone,
} from '@canshift/core'

export interface ControlColors {
  ink: string
  engaged: string
}

const WHITE = '#FFFFFF'

const TONES: Record<ControlTone, (colors: ControlColors) => string> = {
  ink: (c) => c.ink,
  dim: () => WIDGET_DIM_COLORS.night,
  white: () => WHITE,
  engaged: (c) => c.engaged,
  lockLine: () => WIDGET_LOCK_LINE_COLORS.night,
  lockInk: () => WIDGET_LOCK_INK_COLORS.night,
}

export interface ControlSurface {
  borderColor: string
  background: string
  kickerColor: string
  kickerOpacity: number
  wordColor: string
  pulses: boolean
}

export const controlSurface = (state: ControlState, colors: ControlColors): ControlSurface => {
  const paint = CONTROL_PAINT[state]
  return {
    borderColor: TONES[paint.border](colors),
    background: paint.ground === null ? 'transparent' : TONES[paint.ground](colors),
    kickerColor: TONES[paint.kicker](colors),
    kickerOpacity: paint.kicker === 'white' ? CONTROL_KICKER_ENGAGED_OPACITY : 1,
    wordColor: TONES[paint.word](colors),
    pulses: paint.pulses,
  }
}

export const defaultControlColors = (ink: string, engaged: string | undefined): ControlColors => ({
  ink,
  engaged: engaged ?? WIDGET_ACCENT_COLOR,
})

export const statesFor = (control: ControlDefinition | null): readonly ControlState[] => {
  if (!control) return ['off', 'active']
  return CONTROL_STATES.filter((state) => state !== 'armed' || supportsArmed(control))
}

export interface ControlText {
  kicker: string
  qualifier: string
  word: string
}

const DEMO_PARAM: Record<string, number> = {
  level: 3,
  rpm: 4200,
  speedKph: 110,
  gear: 4,
}

export const controlText = (
  control: ControlDefinition,
  state: ControlState,
  fallbackWord: string
): ControlText => {
  const phrase = control.phrases[state]
  const param = DEMO_PARAM[phrase.param] ?? null
  const word = fillParam(phrase.stateWord, param)
  return {
    kicker: control.kicker,
    qualifier: fillParam(phrase.kickerSuffix, param),
    word: word.length > 0 ? word : fallbackWord,
  }
}

export const controlFor = (kicker: string): ControlDefinition | null => controlByKicker(kicker)
