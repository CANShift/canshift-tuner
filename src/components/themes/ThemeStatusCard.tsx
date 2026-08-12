import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface ThemeStatusCardProps {
  isDayMode: boolean | null
  connected: boolean
  simulationMode: boolean
}

type ThemeStatus = 'simulation' | 'disconnected' | 'reading' | 'day' | 'night'

interface ThemeStatusVisual {
  variant: 'day' | 'night'
  icon: string
  label: string
  value: string
  hint: string
}

export const resolveThemeStatus = ({
  isDayMode,
  connected,
  simulationMode,
}: ThemeStatusCardProps): ThemeStatus => {
  if (simulationMode) return 'simulation'
  if (!connected) return 'disconnected'
  if (isDayMode === null) return 'reading'
  return isDayMode ? 'day' : 'night'
}

export const THEME_STATUS: Record<ThemeStatus, ThemeStatusVisual> = {
  simulation: {
    variant: 'night',
    icon: '◐',
    label: 'Theme',
    value: 'Simulation',
    hint: 'Connect a real device to control its theme.',
  },
  disconnected: {
    variant: 'night',
    icon: '◐',
    label: 'Theme',
    value: 'Disconnected',
    hint: 'Plug the device in to read its current theme.',
  },
  reading: {
    variant: 'night',
    icon: '◐',
    label: 'Theme',
    value: 'Reading…',
    hint: 'Waiting for the firmware handshake.',
  },
  day: {
    variant: 'day',
    icon: '☀',
    label: 'Current theme',
    value: 'Day',
    hint: 'Bright palette: light background, dark text.',
  },
  night: {
    variant: 'night',
    icon: '☾',
    label: 'Current theme',
    value: 'Night',
    hint: 'Dark palette: black background, white text.',
  },
}

export const ThemeStatusCard = (props: ThemeStatusCardProps) => {
  const visual = THEME_STATUS[resolveThemeStatus(props)]

  return (
    <div className={cn(card({ variant: visual.variant }))}>
      <div className={ICON}>{visual.icon}</div>
      <div className="flex flex-col gap-1">
        <div className={LABEL}>{visual.label}</div>
        <div className={VALUE}>{visual.value}</div>
        <div className={HINT}>{visual.hint}</div>
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
