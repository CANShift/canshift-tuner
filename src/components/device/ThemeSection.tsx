import { THEME_PRESETS, defaultThemePreset } from '@canshift/core'
import type { ThemePreset } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDeviceStore } from '../../stores/device.store'
import { DayNightControl } from './DayNightControl'
import { DeviceSection } from './DeviceSection'
import { ThemeSampleCard } from './ThemeSampleCard'

const samePreset = (a: ThemePreset | undefined, b: ThemePreset): boolean =>
  a !== undefined && JSON.stringify(a) === JSON.stringify(b)

export const ThemeSection = () => {
  const theme = useDashboardStore((s) => s.config?.theme)
  const setTheme = useDashboardStore((s) => s.setTheme)
  const isDayMode = useDeviceStore((s) => s.isDayMode)
  const activeTheme = theme ?? defaultThemePreset()
  const face = isDayMode === true ? 'day' : 'night'

  return (
    <DeviceSection title="THEME" aside={<DayNightControl />}>
      <div className="mt-5 grid gap-px [grid-template-columns:repeat(auto-fit,minmax(168px,1fr))]">
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
    </DeviceSection>
  )
}
