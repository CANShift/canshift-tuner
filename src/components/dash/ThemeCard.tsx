import { defaultThemePreset } from '@canshift/core'
import { STRINGS } from '../../strings'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDayModeDraft } from '../../hooks/useSettingsDraft'
import { ThemePresetGrid } from '../themes/ThemePresetGrid'
import { Disclosure } from '../chrome/Disclosure'

export const ThemeCard = () => {
  const theme = useDashboardStore((s) => s.config?.theme) ?? defaultThemePreset()
  const setTheme = useDashboardStore((s) => s.setTheme)
  const day = useDayModeDraft().value
  return (
    <Disclosure title={STRINGS.dash.theme} hint={STRINGS.dash.themeHint}>
      <div className="p-3.5 lg:p-5">
        <ThemePresetGrid activeTheme={theme} face={day ? 'day' : 'night'} onSelect={setTheme} />
      </div>
    </Disclosure>
  )
}
