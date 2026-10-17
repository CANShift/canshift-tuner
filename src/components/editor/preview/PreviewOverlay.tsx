import type { ReactNode } from 'react'
import type { CriticalAlert, PagePalette } from '@canshift/core'
import { CutBand } from './CutBand'
import { trackColorFor } from '../../../lib/track-color'
import { AlertTakeover, SplashTakeover } from './Takeover'
import type { PreviewMode } from './preview-modes'
import { useAlertDisplay, useCriticalAlerts } from '../../../hooks/useCriticalAlert'
import { takeoverTextFor } from '../../../lib/critical-alert'

const SAMPLE_CUT = {
  name: 'OVERBOOST',
  detail: '1.61 bar against 1.50',
  elapsed: '2.4 s',
  protective: false,
}

const SAMPLE_SPLASH = { name: 'ANTI-LAG', state: 'ARMED', detail: 'EGT 780 °C · 12 s' }

const SAMPLE_ALERT = { name: 'OIL PRESS', value: '1.1', rule: 'below 1.5 bar' }

const FirstAlertTakeover = ({ scale, alert }: { scale: number; alert: CriticalAlert }) => {
  const { shownFiresAt, unit } = useAlertDisplay(alert)
  return <AlertTakeover scale={scale} {...takeoverTextFor(alert, shownFiresAt, unit)} />
}

const ConfiguredAlertTakeover = ({ scale }: { scale: number }) => {
  const [first] = useCriticalAlerts()
  if (first === undefined) return <AlertTakeover scale={scale} {...SAMPLE_ALERT} />
  return <FirstAlertTakeover scale={scale} alert={first} />
}

export interface PreviewOverlayProps {
  mode: PreviewMode
  scale: number
  bgColor: string
  palette: PagePalette
}

interface OverlayContext {
  scale: number
  bgColor: string
  palette: PagePalette
}

const OVERLAYS: Record<PreviewMode, (ctx: OverlayContext) => ReactNode> = {
  normal: () => null,
  cut: ({ scale, palette }) => (
    <div className="absolute inset-x-0 top-0 z-[3]">
      <CutBand scale={scale} dimColor={palette.textDim} inkColor={palette.text} {...SAMPLE_CUT} />
    </div>
  ),
  splash: ({ scale, bgColor, palette }) => (
    <SplashTakeover
      scale={scale}
      bgColor={bgColor}
      dimColor={palette.textDim}
      trackColor={trackColorFor(bgColor)}
      {...SAMPLE_SPLASH}
    />
  ),
  alert: ({ scale }) => <ConfiguredAlertTakeover scale={scale} />,
}

export const PreviewOverlay = ({ mode, ...ctx }: PreviewOverlayProps) => OVERLAYS[mode](ctx)
