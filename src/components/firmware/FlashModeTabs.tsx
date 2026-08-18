import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type FlashMode = 'flash' | 'erase'

const LABELS: Record<FlashMode, string> = { flash: 'FLASH', erase: 'ERASE' }
const MODES = Object.keys(LABELS) as FlashMode[]

export interface FlashModeTabsProps {
  mode: FlashMode
  onMode: (mode: FlashMode) => void
}

export const FlashModeTabs = ({ mode, onMode }: FlashModeTabsProps) => (
  <div className="mb-8 flex gap-px">
    {MODES.map((value) => (
      <button
        key={value}
        type="button"
        onClick={() => {
          onMode(value)
        }}
        className={cn(segment({ active: value === mode }))}
      >
        {LABELS[value]}
      </button>
    ))}
  </div>
)

const segment = cva(
  [
    'cursor-pointer whitespace-nowrap border px-[26px] py-[11px]',
    'text-[12.5px] font-bold tracking-[0.08em]',
  ].join(' '),
  {
    variants: {
      active: {
        true: 'border-ui-rule bg-ui-rule text-ui-bg',
        false: 'border-ui-ink bg-transparent text-ui-ink hover:bg-ui-panel',
      },
    },
    defaultVariants: { active: false },
  }
)
