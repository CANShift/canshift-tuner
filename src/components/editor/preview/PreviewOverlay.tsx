import type { PagePalette } from '@canshift/core'
import { CutBand } from './CutBand'
import { AlertTakeover, SplashTakeover } from './Takeover'
import type { PreviewMode } from './preview-modes'

const TRACK_DARK = '#222222'
const TRACK_LIGHT = '#C4C4C4'
const LUMINANCE_MID = 0.5

const SAMPLE_CUT = {
  name: 'OVERBOOST',
  detail: '1.61 bar against 1.50',
  elapsed: '2.4 s',
  protective: false,
}

const SAMPLE_SPLASH = { name: 'ANTI-LAG', state: 'ARMED', detail: 'EGT 780 °C · 12 s' }

const SAMPLE_ALERT = { name: 'OIL PRESS', value: '1.1', rule: 'below 1.5 bar' }

const luminance = (hex: string): number => {
  const value = hex.replace('#', '')
  if (value.length !== 6) return 0
  const channel = (offset: number): number => parseInt(value.slice(offset, offset + 2), 16) / 255
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}

export interface PreviewOverlayProps {
  mode: PreviewMode
  scale: number
  bgColor: string
  palette: PagePalette
}

export const PreviewOverlay = ({ mode, scale, bgColor, palette }: PreviewOverlayProps) => {
  if (mode === 'normal') return null
  const track = luminance(bgColor) < LUMINANCE_MID ? TRACK_DARK : TRACK_LIGHT

  if (mode === 'cut') {
    return (
      <div className="absolute inset-x-0 top-0 z-[3]">
        <CutBand
          scale={scale}
          dimColor={palette.textDim}
          inkColor={palette.text}
          name={SAMPLE_CUT.name}
          detail={SAMPLE_CUT.detail}
          elapsed={SAMPLE_CUT.elapsed}
          protective={SAMPLE_CUT.protective}
        />
      </div>
    )
  }

  if (mode === 'splash') {
    return (
      <SplashTakeover
        scale={scale}
        bgColor={bgColor}
        dimColor={palette.textDim}
        trackColor={track}
        name={SAMPLE_SPLASH.name}
        state={SAMPLE_SPLASH.state}
        detail={SAMPLE_SPLASH.detail}
      />
    )
  }

  return (
    <AlertTakeover
      scale={scale}
      name={SAMPLE_ALERT.name}
      value={SAMPLE_ALERT.value}
      rule={SAMPLE_ALERT.rule}
    />
  )
}
