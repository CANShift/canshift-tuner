import { useState } from 'react'
import { THEME_PRESETS, defaultThemePreset } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDeviceStore } from '../../stores/device.store'
import { DayNightControl } from './DayNightControl'
import { ThemePresetGrid, samePreset } from './ThemePresetGrid'

const CUSTOM_THEME = 'custom'

const TOGGLE =
  'w-full cursor-pointer border-0 bg-transparent px-4 py-2.5 text-left font-mono text-[11px] text-ui-muted hover:text-ui-ink'

const useActiveTheme = () => useDashboardStore((s) => s.config?.theme) ?? defaultThemePreset()

const ThemePanel = () => {
  const activeTheme = useActiveTheme()
  const setTheme = useDashboardStore((s) => s.setTheme)
  const isDayMode = useDeviceStore((s) => s.isDayMode)
  return (
    <div className="max-h-[340px] overflow-y-auto border-t border-ui-line px-4 py-3">
      <DayNightControl />
      <ThemePresetGrid
        activeTheme={activeTheme}
        face={isDayMode === true ? 'day' : 'night'}
        onSelect={setTheme}
      />
    </div>
  )
}

export const ThemeSection = () => {
  const activeTheme = useActiveTheme()
  const [open, setOpen] = useState(false)
  const activeEntry = THEME_PRESETS.find((entry) => samePreset(activeTheme, entry.preset))
  const activeLabel = activeEntry?.label ?? CUSTOM_THEME
  const toggleLabel = open ? 'Hide the dash theme' : `Dash theme — ${activeLabel}`

  return (
    <div className="shrink-0 border-t border-ui-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current)
        }}
        className={TOGGLE}
      >
        {toggleLabel}
      </button>
      {open && <ThemePanel />}
    </div>
  )
}
