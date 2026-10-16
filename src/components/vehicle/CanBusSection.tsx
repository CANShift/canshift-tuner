import { SettingRow } from '../device/SettingRow'
import { CAN_SPEED_OPTIONS, parseCanSpeed } from '../../lib/can-speed'
import { useCanSpeedDraft } from '../../hooks/useSettingsDraft'
import { STRINGS } from '../../strings'

export const CanBusSection = () => {
  const speed = useCanSpeedDraft()
  return (
    <section className="max-w-[560px] px-6 py-6">
      <SettingRow
        label={STRINGS.dash.canSpeed}
        note={STRINGS.dash.canSpeedHint}
        value={String(speed.value)}
        options={CAN_SPEED_OPTIONS}
        onChange={(value) => {
          const parsed = parseCanSpeed(value)
          if (parsed !== null) speed.set(parsed)
        }}
      />
    </section>
  )
}
