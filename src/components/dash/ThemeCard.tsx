import { defaultThemePreset } from '@canshift/core'
import { STRINGS } from '../../strings'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDayModeDraft } from '../../hooks/useSettingsDraft'
import { ThemePresetGrid } from '../themes/ThemePresetGrid'

export const ThemeCard = () => {
  const theme = useDashboardStore((s) => s.config?.theme) ?? defaultThemePreset()
  const setTheme = useDashboardStore((s) => s.setTheme)
  const day = useDayModeDraft().value
  return (
    <section className="rounded-card border border-app-border bg-app-surface">
      <header className="flex min-h-[52px] flex-col justify-center px-3.5 py-2 lg:px-5">
        <h2 className="text-[15px] font-normal">{STRINGS.dash.theme}</h2>
        <p className="text-xs text-app-muted lg:text-sm">{STRINGS.dash.themeHint}</p>
      </header>
      <div className="border-t border-app-divider p-3.5 lg:p-5">
        <ThemePresetGrid activeTheme={theme} face={day ? 'day' : 'night'} onSelect={setTheme} />
      </div>
    </section>
  )
}
