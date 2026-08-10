import type { CSSProperties } from 'react'

export const UI_FONT = 'var(--font-ui)'

export const MONO_FONT = 'var(--font-mono)'

export const monoValueStyle: CSSProperties = {
  fontFamily: MONO_FONT,
  fontVariantNumeric: 'tabular-nums',
}

export const UI_LABEL_WEIGHT = 800
export const UI_LABEL_TRACKING = '0.18em'

export const uiLabelStyle: CSSProperties = {
  fontFamily: UI_FONT,
  fontSize: 10,
  fontWeight: UI_LABEL_WEIGHT,
  letterSpacing: UI_LABEL_TRACKING,
  textTransform: 'uppercase',
}

export const uiLabelAtSize = (fontSize: number): CSSProperties => ({
  ...uiLabelStyle,
  fontSize,
})
