import { SCREEN_PROFILES, resolveScreenProfile } from '@canshift/core'
import type { ScreenProfileId, UnitSystem } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useBrightnessDraft } from '../../hooks/useSettingsDraft'
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

const ModelSetting = () => {
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const setTargetProfile = useDashboardStore((s) => s.setTargetProfile)
  return (
    <SettingRow
      label="MODEL"
      note="The panel the layout is measured against."
      value={resolveScreenProfile(targetProfile).id}
      options={MODEL_OPTIONS}
      onChange={(value) => {
        setTargetProfile(value as ScreenProfileId)
      }}
    />
  )
}

const UnitsSetting = () => {
  const units = useDisplayUnits()
  return (
    <SettingRow
      label="UNITS"
      note="Switches every signal that has an imperial equivalent."
      value={units.system}
      options={UNIT_SYSTEM_OPTIONS}
      onChange={(value) => {
        units.setSystem(value as UnitSystem)
      }}
    />
  )
}

const BrightnessSetting = () => {
  const brightness = useBrightnessDraft()
  return (
    <SettingRow
      label="BRIGHTNESS"
      note="Backlight level the dash boots at."
      value={String(brightness.value)}
      options={BRIGHTNESS_OPTIONS}
      onChange={(value) => {
        brightness.set(Number(value))
      }}
    />
  )
}

export const DeviceSettingsSection = () => (
  <DeviceSection title="SETTINGS">
    <ModelSetting />
    <UnitsSetting />
    <BrightnessSetting />
  </DeviceSection>
)
