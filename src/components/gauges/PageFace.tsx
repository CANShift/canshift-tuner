import type { PageConfig, TopBarConfig } from '@canshift/core'
import { PageFrame } from '../editor/canvas/page-frame'
import { useFaceColors } from '../editor/canvas/use-face-colors'
import { useDisplayTier } from '../../hooks/useDisplayTier'
import { useScreenProfile } from '../../hooks/useScreenProfile'

export interface PageFaceProps {
  page: PageConfig
  topBar: TopBarConfig
  scale: number
}

export const PageFace = ({ page, topBar, scale }: PageFaceProps) => {
  const screen = useScreenProfile()
  const tracks = useDisplayTier()
  const colors = useFaceColors(page)
  const topBarHeight = page.showTopBar !== false ? topBar.height : 0
  return (
    <PageFrame
      scale={scale}
      areaWidth={screen.width}
      areaHeight={screen.height - topBarHeight}
      page={page}
      topBar={topBar}
      palette={colors.palette}
      bgColor={colors.bgColor}
      isDayMode={colors.isDayMode}
      tracks={tracks}
      screenHeight={screen.height}
      revLimiting={false}
    />
  )
}
