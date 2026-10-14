import type { PageConfig, PagePalette } from '@canshift/core'
import { useDashboardStore } from '../../../stores/dashboard.store'
import { useActiveDayMode } from '../../../hooks/useActiveDayMode'
import { resolveBgColor, resolvePalette } from '../../../hooks/useEffectivePalette'

export interface FaceColors {
  isDayMode: boolean
  palette: PagePalette
  bgColor: string
}

export const useFaceColors = (page: PageConfig): FaceColors => {
  const theme = useDashboardStore((s) => s.config?.theme)
  const isDayMode = useActiveDayMode()
  return {
    isDayMode,
    palette: resolvePalette(isDayMode, theme?.day.palette, theme?.night.palette, page.palette),
    bgColor: resolveBgColor(
      isDayMode,
      theme?.day.bgColor,
      theme?.night.bgColor,
      page.backgroundColor
    ),
  }
}
