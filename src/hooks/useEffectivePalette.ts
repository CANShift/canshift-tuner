import { useMemo } from 'react'
import type { PageConfig, PagePalette } from '@canshift/core'
import { DEFAULT_PAGE_PALETTE } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useDeviceStore } from '../stores/device.store'
import { DAY_PALETTE_DEFAULT, DAY_BG_DEFAULT } from '../constants/theme'

export interface EffectivePalette {
  isDayMode: boolean
  palette: PagePalette
  bgColor: string
}

export const resolvePalette = (
  isDayMode: boolean,
  dayPalette: PagePalette | undefined,
  nightPalette: PagePalette | undefined,
  pagePalette: PagePalette | undefined
): PagePalette =>
  isDayMode
    ? (dayPalette ?? DAY_PALETTE_DEFAULT)
    : (nightPalette ?? pagePalette ?? DEFAULT_PAGE_PALETTE)

export const resolveBgColor = (
  isDayMode: boolean,
  dayBgColor: string | undefined,
  nightBgColor: string | undefined,
  pageBgColor: string
): string => (isDayMode ? (dayBgColor ?? DAY_BG_DEFAULT) : (nightBgColor ?? pageBgColor))

export const useEffectivePalette = (page: PageConfig): EffectivePalette => {
  const dayTheme = useDashboardStore((s) => s.config?.dayTheme)
  const nightTheme = useDashboardStore((s) => s.config?.nightTheme)
  const isDayMode = useDeviceStore((s) => s.isDayMode) ?? false

  const palette = useMemo(
    () => resolvePalette(isDayMode, dayTheme?.palette, nightTheme?.palette, page.palette),
    [isDayMode, dayTheme?.palette, nightTheme?.palette, page.palette]
  )

  const bgColor = resolveBgColor(
    isDayMode,
    dayTheme?.bgColor,
    nightTheme?.bgColor,
    page.backgroundColor
  )

  return { isDayMode, palette, bgColor }
}
