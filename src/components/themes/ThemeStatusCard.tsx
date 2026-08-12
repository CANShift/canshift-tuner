import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface ThemeStatusCardProps {
  isDayMode: boolean | null
  connected: boolean
  simulationMode: boolean
}

export const ThemeStatusCard = ({ isDayMode, connected, simulationMode }: ThemeStatusCardProps) => {
  if (simulationMode) {
    return (
      <div className={cn(card({ variant: 'night' }))}>
        <div className={ICON}>◐</div>
        <div className="flex flex-col gap-1">
          <div className={LABEL}>Theme</div>
          <div className={VALUE}>Simulation</div>
          <div className={HINT}>Connect a real device to control its theme.</div>
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className={cn(card({ variant: 'night' }))}>
        <div className={ICON}>◐</div>
        <div className="flex flex-col gap-1">
          <div className={LABEL}>Theme</div>
          <div className={VALUE}>Disconnected</div>
          <div className={HINT}>Plug the device in to read its current theme.</div>
        </div>
      </div>
    )
  }

  if (isDayMode === null) {
    return (
      <div className={cn(card({ variant: 'night' }))}>
        <div className={ICON}>◐</div>
        <div className="flex flex-col gap-1">
          <div className={LABEL}>Theme</div>
          <div className={VALUE}>Reading…</div>
          <div className={HINT}>Waiting for the firmware handshake.</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(card({ variant: isDayMode ? 'day' : 'night' }))}>
      <div className={ICON}>{isDayMode ? '☀' : '☾'}</div>
      <div className="flex flex-col gap-1">
        <div className={LABEL}>Current theme</div>
        <div className={VALUE}>{isDayMode ? 'Day' : 'Night'}</div>
        <div className={HINT}>
          {isDayMode
            ? 'Bright palette: light background, dark text.'
            : 'Dark palette: black background, white text.'}
        </div>
      </div>
    </div>
  )
}

const ICON = 'text-[40px] leading-none'

const LABEL = 'text-[10px] uppercase tracking-[0.1em] opacity-70'

const VALUE = 'text-[20px] font-bold tracking-[-0.01em]'

const HINT = 'text-[12px] opacity-75'

const card = cva(
  'flex items-center gap-[18px] border border-solid px-[22px] py-5 [transition:background_200ms_ease,border-color_200ms_ease,color_200ms_ease]',
  {
    variants: {
      variant: {
        day: 'border-[hsl(45_70%_70%)] bg-[hsl(45_90%_95%)] text-[hsl(45_50%_18%)]',
        night: 'border-border bg-bg-inset text-text',
      },
    },
    defaultVariants: { variant: 'night' },
  }
)
