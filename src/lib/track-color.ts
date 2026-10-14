const TRACK_DARK = '#222222'
const TRACK_LIGHT = '#C4C4C4'
const LUMINANCE_MID = 0.5
const HEX_DIGITS = 6

const luminance = (hex: string): number => {
  const value = hex.replace('#', '')
  if (value.length !== HEX_DIGITS) return 0
  const channel = (offset: number): number => parseInt(value.slice(offset, offset + 2), 16) / 255
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}

export const trackColorFor = (bgColor: string): string =>
  luminance(bgColor) < LUMINANCE_MID ? TRACK_DARK : TRACK_LIGHT
