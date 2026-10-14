import { useState } from 'react'
import { THEME_PRESETS, defaultThemePreset } from '@canshift/core'
import type { ThemePreset } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDeviceStore } from '../../stores/device.store'
import { DayNightControl } from './DayNightControl'
import { ThemeSampleCard } from './ThemeSampleCard'

const CUSTOM_THEME = 'custom'

const samePreset = (a: ThemePreset | undefined, b: ThemePreset): boolean =>
  a !== undefined && JSON.stringify(a) === JSON.stringify(b)

export const ThemeSection = () => {
  const theme = useDashboardStore((s) => s.config?.theme)
  const setTheme = useDashboardStore((s) => s.setTheme)
  const isDayMode = useDeviceStore((s) => s.isDayMode)
  const [open, setOpen] = useState(false)
  const activeTheme = theme ?? defaultThemePreset()
  const face = isDayMode === true ? 'day' : 'night'
  const activeLabel =
    THEME_PRESETS.find((entry) => samePreset(activeTheme, entry.preset))?.label ?? CUSTOM_THEME

  return (
    <div className="shrink-0 border-t border-ui-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current)
        }}
        className="w-full cursor-pointer border-0 bg-transparent px-4 py-2.5 text-left font-mono text-[11px] text-ui-muted hover:text-ui-ink"
      >
        {open ? 'Hide the dash theme' : `Dash theme — ${activeLabel}`}
      </button>
      {open && (
        <div className="max-h-[340px] overflow-y-auto border-t border-ui-line px-4 py-3">
          <DayNightControl />
          <div className="mt-3 grid gap-px [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            {THEME_PRESETS.map((entry) => (
              <ThemeSampleCard
                key={entry.id}
                entry={entry}
                face={face}
                active={samePreset(activeTheme, entry.preset)}
                onSelect={() => {
                  setTheme(entry.preset)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
