import type { UnitSystem } from '@canshift/core'
import { SCREEN_SETTINGS_BOUNDS } from '@canshift/core'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STRINGS } from '../../strings'
import { useDisplayUnits } from '../../hooks/useDisplayUnits'
import { useBrightnessDraft } from '../../hooks/useSettingsDraft'
import { useSyncStore } from '../../stores/sync/sync.store'

const D = STRINGS.dash

const UnitsRow = () => {
  const units = useDisplayUnits()
  return (
    <div className="flex h-14 items-center gap-3 border-b border-app-divider lg:h-[60px]">
      <span className="flex-1 text-[15px]">{D.units}</span>
      <ToggleGroup
        type="single"
        aria-label={D.units}
        value={units.system}
        onValueChange={(value) => {
          if (value.length > 0) units.setSystem(value as UnitSystem)
        }}
      >
        <ToggleGroupItem value="metric" className="h-10 text-sm">
          {D.metric}
        </ToggleGroupItem>
        <ToggleGroupItem value="imperial" className="h-10 text-sm">
          {D.imperial}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

const BrightnessRow = () => {
  const brightness = useBrightnessDraft()
  const onDash = useSyncStore((s) => s.device.settings.brightness)
  const unsent = onDash !== null && onDash !== brightness.value
  return (
    <div className="flex h-14 items-center gap-3 lg:h-[60px]">
      <span className="w-[84px] text-[15px] lg:w-24">{D.brightness}</span>
      <Slider
        thumbLabel={D.brightness}
        min={SCREEN_SETTINGS_BOUNDS.brightnessMinPct}
        max={SCREEN_SETTINGS_BOUNDS.brightnessMaxPct}
        value={[brightness.value]}
        onValueChange={([value]) => {
          if (value !== undefined) brightness.set(value)
        }}
        className="flex-1"
      />
      <span
        className={cn(
          'w-11 text-right font-num text-sm',
          unsent ? 'text-app-warning' : 'text-app-secondary'
        )}
      >
        {STRINGS.changes.percent(brightness.value)}
      </span>
    </div>
  )
}

export const DisplayCard = () => (
  <section className="flex flex-col rounded-card border border-app-border bg-app-surface px-3.5 py-1 lg:px-5 lg:py-2">
    <UnitsRow />
    <BrightnessRow />
  </section>
)
