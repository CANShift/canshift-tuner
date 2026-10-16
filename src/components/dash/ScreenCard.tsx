import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { STRINGS } from '../../strings'
import type { ScreenRotation } from '../../lib/sync/setup'
import { useDayModeDraft, useRotationDraft } from '../../hooks/useSettingsDraft'
import { CalibrateButton } from './CalibrateButton'

const D = STRINGS.dash

const ROW = 'flex min-h-14 items-center gap-3 border-b border-app-divider py-2 last:border-b-0'

const RotationRow = () => {
  const rotation = useRotationDraft()
  return (
    <div className={ROW}>
      <span className="flex flex-1 flex-col">
        <span className="text-[15px]">{D.rotation}</span>
        <span className="text-xs text-app-muted">{D.rotationHint}</span>
      </span>
      <ToggleGroup
        type="single"
        aria-label={D.rotation}
        value={String(rotation.value)}
        onValueChange={(value) => value.length > 0 && rotation.set(Number(value) as ScreenRotation)}
      >
        <ToggleGroupItem value="0" className="text-sm">
          0°
        </ToggleGroupItem>
        <ToggleGroupItem value="180" className="text-sm">
          180°
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

const ModeRow = () => {
  const mode = useDayModeDraft()
  return (
    <div className={ROW}>
      <span className="flex-1 text-[15px]">{D.mode}</span>
      <ToggleGroup
        type="single"
        aria-label={D.mode}
        value={mode.value ? 'day' : 'night'}
        onValueChange={(value) => value.length > 0 && mode.set(value === 'day')}
      >
        <ToggleGroupItem value="day" className="text-sm">
          {D.day}
        </ToggleGroupItem>
        <ToggleGroupItem value="night" className="text-sm">
          {D.night}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export const ScreenCard = () => (
  <section className="flex flex-col rounded-card border border-app-border bg-app-surface px-3.5 py-1 lg:px-5 lg:py-2">
    <h2 className="pt-2 text-[17px] font-bold">{D.screen}</h2>
    <ModeRow />
    <RotationRow />
    <div className={ROW}>
      <CalibrateButton />
    </div>
  </section>
)
