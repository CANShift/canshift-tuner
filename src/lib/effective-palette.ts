import type { PagePalette } from '@canshift/core'
import { DEFAULT_PAGE_PALETTE } from '@canshift/core'
import { DAY_PALETTE_DEFAULT, DAY_BG_DEFAULT } from '../constants/theme'

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
