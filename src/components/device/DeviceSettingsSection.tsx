import { SCREEN_PROFILES, resolveScreenProfile } from '@canshift/core'
import type { ScreenProfileId, UnitSystem } from '@canshift/core'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useScreenSettingsStore } from '../../stores/screen-settings.store'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { provisionMessage, useProvisionBoardProfile } from '../../hooks/useProvisionBoardProfile'
import { UNIT_SYSTEM_OPTIONS } from '../../constants/units'
import { BoardProfileRow } from './BoardProfileRow'
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

const provisionBlockedNote = (hasBoard: boolean, linked: boolean): string => {
  if (!hasBoard) return 'No board picked — choose one in the board definition below.'
  if (!linked) return 'Connect the dash over USB to write its board profile.'
  return ''
}

export interface DeviceSettingsSectionProps {
  advancedOpen: boolean
  onToggleAdvanced: () => void
}

export const DeviceSettingsSection = ({
  advancedOpen,
  onToggleAdvanced,
}: DeviceSettingsSectionProps) => {
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const setTargetProfile = useDashboardStore((s) => s.setTargetProfile)
  const brightness = useScreenSettingsStore((s) => s.brightness)
  const updateScreen = useScreenSettingsStore((s) => s.update)
  const units = useDisplayUnits()
  const provision = useProvisionBoardProfile()

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
      <BoardProfileRow
        boardName={provision.resolved?.profile.boardName ?? null}
        canProvision={provision.canProvision}
        busy={provision.state.kind === 'writing'}
        blockedNote={provisionBlockedNote(provision.resolved !== null, provision.linked)}
        note={provisionMessage(provision.state)}
        onProvision={provision.provision}
      />
      <button
        type="button"
        aria-expanded={advancedOpen}
        onClick={onToggleAdvanced}
        className="mt-4 cursor-pointer border-0 bg-transparent p-0 font-mono text-[11.5px] text-ui-muted hover:text-ui-ink"
      >
        {advancedOpen ? 'Hide the board definition' : 'Board definition — pins, driver, CAN…'}
      </button>
    </DeviceSection>
  )
}
