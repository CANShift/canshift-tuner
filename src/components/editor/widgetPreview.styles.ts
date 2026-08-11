export const FONT_WEIGHT_VALUE = 900

export const BLINK_ANIM = 'canshift-blink 0.7s step-end infinite'

export const BLINK_KEYFRAMES_CSS =
  '@keyframes canshift-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }'

export const thresholdPct = (level: number, min: number, max: number): number => {
  const range = max - min || 1
  return Math.max(0, Math.min(1, (level - min) / range))
}
