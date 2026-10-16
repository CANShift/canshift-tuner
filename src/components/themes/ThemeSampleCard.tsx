import type { ThemePresetEntry } from '@canshift/core'
import { cn } from '@/lib/utils'
import { trackColorFor } from '../../lib/track-color'

const DANGER = '#FF4444'
const WATER_FILL_PERCENT = 70

export interface ThemeSampleCardProps {
  entry: ThemePresetEntry
  face: 'night' | 'day'
  active: boolean
  onSelect: () => void
}

type Palette = NonNullable<ThemePresetEntry['preset']['night']['palette']>

const WaterSample = ({ palette, track }: { palette: Palette; track: string }) => (
  <div
    className="pt-1.5"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ borderTop: `2px solid ${palette.text}` }}
  >
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <div className="mb-1 text-[8.5px] tracking-[0.18em]" style={{ color: palette.textDim }}>
      WATER
    </div>
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <div className="text-[24px] leading-[0.92] tracking-[-0.04em]" style={{ color: palette.text }}>
      98
      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <span className="text-[10px] tracking-normal" style={{ color: palette.textDim }}>
        {' '}
        °C
      </span>
    </div>
    {/* eslint-disable-next-line no-inline-style/no-inline-style */}
    <div className="mt-2 h-[3px]" style={{ background: track }}>
      <div
        className="h-full"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ width: `${String(WATER_FILL_PERCENT)}%`, background: palette.text }}
      />
    </div>
  </div>
)

const OilSample = ({ palette }: { palette: Palette }) => (
  <div
    className="mt-2.5 pt-1.5"
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ borderTop: `2px solid ${DANGER}` }}
  >
    <div className="mb-1 text-[8.5px] tracking-[0.18em] text-[#FF4444]">OIL PRESS</div>
    <div className="text-[16px] leading-[0.92] text-[#FF4444]">
      1.1
      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <span className="text-[9px]" style={{ color: palette.textDim }}>
        {' '}
        bar
      </span>
    </div>
  </div>
)

const SampleCaption = ({ label, active }: { label: string; active: boolean }) => (
  <div
    className={cn(
      'px-[13px] py-2 font-mono text-[10.5px] tracking-[0.14em]',
      active ? 'bg-app-text text-app-bg' : 'bg-app-surface text-app-text'
    )}
  >
    <div>{label.toUpperCase()}</div>
    <div className="mt-[3px] text-[9.5px] tracking-[0.04em] opacity-75">
      danger red never changes
    </div>
  </div>
)

export const ThemeSampleCard = ({ entry, face, active, onSelect }: ThemeSampleCardProps) => {
  const preset = entry.preset[face]
  const palette = preset.palette
  if (!palette) return null
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'cursor-pointer border-0 p-0 text-left',
        active ? 'outline outline-2 outline-app-accent' : 'hover:opacity-90'
      )}
    >
      {/* eslint-disable-next-line no-inline-style/no-inline-style */}
      <div className="px-[13px] pb-[13px] pt-3 font-mono" style={{ background: preset.bgColor }}>
        <WaterSample palette={palette} track={trackColorFor(preset.bgColor)} />
        <OilSample palette={palette} />
      </div>
      <SampleCaption label={entry.label} active={active} />
    </button>
  )
}
