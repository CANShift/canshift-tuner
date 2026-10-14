import { SCREEN_PROFILES, resolveScreenProfile } from '@canshift/core'
import type { ScreenProfileId, UnitSystem } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useScreenSettingsStore } from '../../stores/screen-settings.store'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { UNIT_SYSTEM_OPTIONS } from '../../constants/units'
import { DeviceSection } from './DeviceSection'
import { SettingRow } from './SettingRow'

const BRIGHTNESS_OPTIONS = [20, 40, 60, 80, 100].map((step) => ({
  value: String(step),
  label: `${String(step)} %`,
}))

const MODEL_OPTIONS = SCREEN_PROFILES.map((profile) => ({
  value: profile.id,
  label: profile.name,
}))

export const DeviceSettingsSection = () => {
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const setTargetProfile = useDashboardStore((s) => s.setTargetProfile)
  const brightness = useScreenSettingsStore((s) => s.brightness)
  const updateScreen = useScreenSettingsStore((s) => s.update)
  const units = useDisplayUnits()

  return (
    <DeviceSection title="SETTINGS">
      <SettingRow
        label="MODEL"
        note="The panel the layout is measured against."
        value={resolveScreenProfile(targetProfile).id}
        options={MODEL_OPTIONS}
        onChange={(value) => {
          setTargetProfile(value as ScreenProfileId)
        }}
      />
      <SettingRow
        label="UNITS"
        note="Switches every signal that has an imperial equivalent."
        value={units.system}
        options={UNIT_SYSTEM_OPTIONS}
        onChange={(value) => {
          units.setSystem(value as UnitSystem)
        }}
      />
      <SettingRow
        label="BRIGHTNESS"
        note="Backlight level the dash boots at."
        value={String(brightness)}
        options={BRIGHTNESS_OPTIONS}
        onChange={(value) => {
          updateScreen({ brightness: Number(value) })
        }}
      />
    </DeviceSection>
  )
}
