import type { PageConfig } from '@canshift/core'
import ScreenSettingsPanel from '../ScreenSettingsPanel'
import DiagnosticsPanel from '../DiagnosticsPanel'
import { RevLimiterOverlay } from '../RevLimiterOverlay'
import { PreviewOverlay } from '../preview/PreviewOverlay'
import type { PreviewMode } from '../preview/preview-modes'
import { RubberBandRect, type RubberBandRectProps } from './rubber-band-rect'
import { useFaceColors } from './use-face-colors'
import type { CanvasDialogs } from '../../../hooks/useCanvasDialogs'
import type { UseRevLimiterFlashResult } from '../../../hooks/useRevLimiterFlash'

export interface CanvasOverlayProps {
  page: PageConfig
  canvasWidth: number
  scale: number
  previewMode: PreviewMode
  rubberBand: RubberBandRectProps['rubberBand']
  dialogs: CanvasDialogs
  revLimiter: UseRevLimiterFlashResult
}

export const CanvasOverlay = ({
  page,
  canvasWidth,
  scale,
  previewMode,
  rubberBand,
  dialogs,
  revLimiter,
}: CanvasOverlayProps) => {
  const { palette, bgColor } = useFaceColors(page)
  return (
    <>
      <RubberBandRect rubberBand={rubberBand} effScale={scale} />
      {dialogs.settingsOpen && <ScreenSettingsPanel scale={scale} />}
      {dialogs.diagOpen && <DiagnosticsPanel scale={scale} />}
      {revLimiter.revLimiting && (
        <RevLimiterOverlay
          canvasW={canvasWidth * scale}
          flashPhase={revLimiter.flashPhase}
          scale={scale}
        />
      )}
      <PreviewOverlay mode={previewMode} scale={scale} bgColor={bgColor} palette={palette} />
    </>
  )
}
