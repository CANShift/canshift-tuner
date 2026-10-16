import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STRINGS } from '../../strings'
import { CAN_SPEED_OPTIONS, parseCanSpeed } from '../../lib/can-speed'
import { useCanSpeedDraft } from '../../hooks/useSettingsDraft'

const SpeedOptions = () => (
  <SelectContent>
    {CAN_SPEED_OPTIONS.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))}
  </SelectContent>
)

export const CanSpeedCard = () => {
  const speed = useCanSpeedDraft()
  return (
    <section className="flex items-center gap-3 rounded-card border border-app-border bg-app-surface px-3.5 py-2 lg:px-5 lg:py-4">
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px]">{STRINGS.dash.canSpeed}</span>
        <span className="text-xs text-app-muted lg:text-[13px]">{STRINGS.dash.canSpeedHint}</span>
      </div>
      <Select
        value={String(speed.value)}
        onValueChange={(value) => {
          const parsed = parseCanSpeed(value)
          if (parsed !== null) speed.set(parsed)
        }}
      >
        <SelectTrigger
          aria-label={STRINGS.dash.canSpeed}
          className="h-12 w-auto gap-2 rounded-control border-app-border px-3 text-[15px] lg:h-11"
        >
          <SelectValue />
        </SelectTrigger>
        <SpeedOptions />
      </Select>
    </section>
  )
}
