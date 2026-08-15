import { pushHistory } from './helpers'
import type { SliceCreator, ThemeSlice } from './types'

export const createThemeSlice: SliceCreator<ThemeSlice> = (set) => ({
  isPreviewDayMode: false,

  togglePreviewTheme: () => {
    set((s) => {
      s.isPreviewDayMode = !s.isPreviewDayMode
    })
  },

  setTheme: (theme) => {
    set((s) => {
      if (!s.config) return
      pushHistory(s, theme === null ? 'Cleared theme' : 'Changed theme')
      if (theme === null) {
        delete s.config.theme
      } else {
        s.config.theme = theme
      }
      s.isDirty = true
    })
  },
})
