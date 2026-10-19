import type { PageConfig, TopBarConfig } from '@canshift/core'
import { useFaceColors } from '../editor/canvas/use-face-colors'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useIsLaptop } from '../../hooks/useIsLaptop'
import { useScreenProfile } from '../../hooks/useScreenProfile'
import { GaugeHitLayer } from './GaugeHitLayer'
import { useGaugeManipulation, type PreviewArea } from '../../hooks/useGaugeManipulation'
import { PreviewOverlay } from '../editor/preview/PreviewOverlay'
import { PageFace } from './PageFace'
import type { PreviewMode } from '../editor/preview/preview-modes'

export interface GaugePreviewProps {
  page: PageConfig
  topBar: TopBarConfig
  scale: number
  selectedId: string | null
  mode: PreviewMode
  onSelect: (widgetId: string) => void
}

const usePreviewGeometry = (page: PageConfig, topBar: TopBarConfig) => {
  const screen = useScreenProfile()
  const isLaptop = useIsLaptop()
  const topBarHeight = page.showTopBar !== false ? topBar.height : 0
  return { screen, isLaptop, topBarHeight, areaHeight: screen.height - topBarHeight }
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

interface EditableHitLayerProps {
  area: PreviewArea
  page: PageConfig
  top: number
  isLaptop: boolean
  selectedId: string | null
  onSelect: (widgetId: string) => void
}

const EditableHitLayer = ({ area, isLaptop, ...props }: EditableHitLayerProps) => {
  const selectedIds = useDashboardStore((s) => s.selectedWidgetIds)
  const manipulation = useGaugeManipulation(props.page, area, isLaptop)
  return (
    <GaugeHitLayer
      {...area}
      {...props}
      selectedIds={selectedIds}
      manipulation={isLaptop ? manipulation : null}
    />
  )
}

export const GaugePreview = ({ page, topBar, scale, ...props }: GaugePreviewProps) => {
  const { screen, isLaptop, topBarHeight, areaHeight } = usePreviewGeometry(page, topBar)
  const area = { scale, areaWidth: screen.width, areaHeight }
  return (
    <div className="relative w-fit font-sans outline-solid outline-1 outline-app-border">
      <PageFace page={page} topBar={topBar} scale={scale} />
      <ModeOverlay mode={props.mode} scale={scale} top={topBarHeight * scale} page={page} />
      <EditableHitLayer
        area={area}
        page={page}
        top={topBarHeight * scale}
        isLaptop={isLaptop}
        selectedId={props.selectedId}
        onSelect={props.onSelect}
      />
    </div>
  )
}
