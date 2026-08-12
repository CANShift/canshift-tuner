import { Button } from '../ui/button'

export interface ThemeControlsProps {
  isDayMode: boolean | null
  disabled: boolean
  busy: boolean
  onToggle: () => void
  onSetDay: () => void
  onSetNight: () => void
}

export const ThemeControls = ({
  isDayMode,
  disabled,
  busy,
  onToggle,
  onSetDay,
  onSetNight,
}: ThemeControlsProps) => {
  return (
    <div className="flex flex-col gap-3">
      <Button onClick={onToggle} disabled={disabled || busy}>
        Toggle day / night
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onSetDay}
          disabled={disabled || busy || isDayMode === true}
        >
          Force Day
        </Button>
        <Button
          variant="outline"
          onClick={onSetNight}
          disabled={disabled || busy || isDayMode === false}
        >
          Force Night
        </Button>
      </div>
      {busy && (
        <div className="text-[11px] uppercase tracking-[0.06em] text-text-muted">Sending…</div>
      )}
    </div>
  )
}
