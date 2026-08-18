import type { ThemePresetEntry } from '@canshift/core'
import { cn } from '@/lib/utils'
import { trackColorFor } from '../themes/ThemeCard'

const DANGER = '#FF4444'
const WATER_FILL_PERCENT = 70

export interface ThemeSampleCardProps {
  entry: ThemePresetEntry
  face: 'night' | 'day'
  active: boolean
  onSelect: () => void
}

export const ThemeSampleCard = ({ entry, face, active, onSelect }: ThemeSampleCardProps) => {
  const preset = entry.preset[face]
  const palette = preset.palette
  if (!palette) return null
  const track = trackColorFor(preset.bgColor)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'cursor-pointer border-0 p-0 text-left',
        active ? 'outline outline-2 outline-ui-accent' : 'hover:opacity-90'
      )}
    >
      <div
        className="px-[13px] pb-[13px] pt-3 font-mono"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ background: preset.bgColor }}
      >
        <div
          className="pt-1.5"
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ borderTop: `2px solid ${palette.text}` }}
        >
          <div
            className="mb-1 text-[8.5px] tracking-[0.18em]"
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ color: palette.textDim }}
          >
            WATER
          </div>
          <div
            className="text-[24px] leading-[0.92] tracking-[-0.04em]"
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ color: palette.text }}
          >
            98
            <span
              className="text-[10px] tracking-normal"
              // eslint-disable-next-line no-inline-style/no-inline-style
              style={{ color: palette.textDim }}
            >
              {' '}
              °C
            </span>
          </div>
          <div
            className="mt-2 h-[3px]"
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ background: track }}
          >
            <div
              className="h-full"
              // eslint-disable-next-line no-inline-style/no-inline-style
              style={{ width: `${String(WATER_FILL_PERCENT)}%`, background: palette.text }}
            />
          </div>
        </div>
        <div
          className="mt-2.5 pt-1.5"
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ borderTop: `2px solid ${DANGER}` }}
        >
          <div className="mb-1 text-[8.5px] tracking-[0.18em] text-[#FF4444]">OIL PRESS</div>
          <div className="text-[16px] leading-[0.92] text-[#FF4444]">
            1.1
            <span
              className="text-[9px]"
              // eslint-disable-next-line no-inline-style/no-inline-style
              style={{ color: palette.textDim }}
            >
              {' '}
              bar
            </span>
          </div>
        </div>
      </div>
      <div
        className={cn(
          'px-[13px] py-2 font-mono text-[10.5px] tracking-[0.14em]',
          active ? 'bg-ui-rule text-ui-bg' : 'bg-ui-panel text-ui-ink'
        )}
      >
        <div>{entry.label.toUpperCase()}</div>
        <div className="mt-[3px] text-[9.5px] tracking-[0.04em] opacity-75">
          danger red never changes
        </div>
      </div>
    </button>
  )
}
