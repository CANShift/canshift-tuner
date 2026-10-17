import { STRINGS } from '../../strings'

export interface PressedLightProps {
  pressed: boolean
}

export const PressedLight = ({ pressed }: PressedLightProps) => (
  <span
    role="status"
    aria-label={pressed ? STRINGS.car.pressed : STRINGS.car.released}
    data-pressed={pressed}
    className="size-3.5 shrink-0 rounded-full border border-app-border bg-app-surface-2 transition-colors data-[pressed=true]:border-app-accent data-[pressed=true]:bg-app-accent data-[pressed=true]:shadow-[0_0_8px_var(--app-accent)]"
  />
)
