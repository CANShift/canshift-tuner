export const BLINK_ANIM = 'canshift-blink 0.7s step-end infinite'

export const thresholdPct = (level: number, min: number, max: number): number => {
  const range = max - min || 1
  return Math.max(0, Math.min(1, (level - min) / range))
}
