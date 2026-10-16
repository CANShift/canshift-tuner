import { useMemo } from 'react'
import type { PageConfig, TopBarConfig } from '@canshift/core'
import { resolveScreenProfile } from '@canshift/core'
import { PageFrame } from '../editor/canvas/page-frame'
import { useFaceColors } from '../editor/canvas/use-face-colors'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDisplayTier } from '../../hooks/useDisplayTier'
import { useIsLaptop } from '../../hooks/useIsLaptop'
import { GaugeHitLayer } from './GaugeHitLayer'
import { PreviewOverlay } from '../editor/preview/PreviewOverlay'
import type { PreviewMode } from '../editor/preview/preview-modes'

const PHONE_SCALE = 1
const LAPTOP_SCALE = 2

export interface GaugePreviewProps {
  page: PageConfig
  topBar: TopBarConfig
  selectedId: string | null
  mode: PreviewMode
  onSelect: (widgetId: string) => void
}

const useScreen = () => {
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  return useMemo(() => resolveScreenProfile(targetProfile), [targetProfile])
}

const usePreviewGeometry = (page: PageConfig, topBar: TopBarConfig) => {
  const screen = useScreen()
  const scale = useIsLaptop() ? LAPTOP_SCALE : PHONE_SCALE
  const topBarHeight = page.showTopBar !== false ? topBar.height : 0
  return { screen, scale, topBarHeight, areaHeight: screen.height - topBarHeight }
}

interface ModeOverlayProps {
  mode: PreviewMode
  scale: number
  top: number
  page: PageConfig
}

const ModeOverlay = ({ mode, scale, top, page }: ModeOverlayProps) => {
  const colors = useFaceColors(page)
  return (
    <div
      className="absolute inset-x-0 bottom-0 overflow-hidden"
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ top }}
    >
      <PreviewOverlay mode={mode} scale={scale} bgColor={colors.bgColor} palette={colors.palette} />
    </div>
  )
}

export const GaugePreview = ({ page, topBar, selectedId, mode, onSelect }: GaugePreviewProps) => {
  const { screen, scale, topBarHeight, areaHeight } = usePreviewGeometry(page, topBar)
  const tracks = useDisplayTier()
  const colors = useFaceColors(page)
  const area = { scale, areaWidth: screen.width, areaHeight }
  return (
    <div className="relative w-fit font-sans outline outline-1 outline-app-border">
      <PageFrame
        {...area}
        page={page}
        topBar={topBar}
        palette={colors.palette}
        bgColor={colors.bgColor}
        isDayMode={colors.isDayMode}
        tracks={tracks}
        screenHeight={screen.height}
        revLimiting={false}
      />
      <ModeOverlay mode={mode} scale={scale} top={topBarHeight * scale} page={page} />
      <GaugeHitLayer
        {...area}
        page={page}
        top={topBarHeight * scale}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  )
}
