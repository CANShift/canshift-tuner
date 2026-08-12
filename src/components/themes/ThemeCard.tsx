import type { ThemePresetEntry } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { MetaText } from '../ui/meta-text'

export type ThemeSlotBadge = 'night' | 'day' | null

export interface ThemeCardProps {
  entry: ThemePresetEntry
  badge: ThemeSlotBadge
  targetSlot: 'night' | 'day'
  onSelect: () => void
}

export const hexLuminance = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export const trackColorFor = (bgColor: string): string =>
  hexLuminance(bgColor) < 0.5 ? '#222222' : '#C4C4C4'

export const ThemeCard = ({ entry, badge, targetSlot, onSelect }: ThemeCardProps) => {
  const palette = entry.preset.palette
  if (!palette) return null
  const ramp = [
    entry.preset.bgColor,
    palette.surface,
    trackColorFor(entry.preset.bgColor),
    palette.textDim,
    palette.danger,
    palette.accent,
  ]

  return (
    <button
      type="button"
      onClick={onSelect}
      title={`Set as the ${targetSlot} theme of the working dashboard`}
      className={cn(card({ active: badge === 'night' }))}
    >
      <div className="flex w-full items-baseline gap-2.5 border-b-2 border-brand-divider px-3.5 py-3">
        <span className="text-[13px] font-extrabold text-brand-text">{entry.label}</span>
        <MetaText align="end" className={cn(badge === 'night' && 'text-brand-accent')}>
          {badge === 'night' ? 'active — night' : badge === 'day' ? 'auto at day' : entry.note}
        </MetaText>
      </div>
      <div
        className="flex h-[140px] w-full items-end gap-4 p-4 font-mono"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ background: entry.preset.bgColor, color: palette.text }}
      >
        <span className="text-[52px] leading-[0.9]">5200</span>
        {/* eslint-disable-next-line no-inline-style/no-inline-style */}
        <span className={PREVIEW_MID} style={{ color: palette.textDim }}>
          195
        </span>
        {/* eslint-disable-next-line no-inline-style/no-inline-style */}
        <span className={cn(PREVIEW_MID, 'ml-auto')} style={{ color: palette.danger }}>
          1.1
        </span>
      </div>
      <div className="flex h-[26px] w-full">
        {ramp.map((color, i) => (
          // eslint-disable-next-line no-inline-style/no-inline-style
          <div key={i} className="flex-1" style={{ background: color }} />
        ))}
      </div>
    </button>
  )
}

const PREVIEW_MID = 'text-[30px] leading-[0.9]'

const card = cva(
  'flex cursor-pointer flex-col border-2 border-solid p-0 text-left [background:none] [font-family:inherit]',
  {
    variants: {
      active: {
        true: 'border-brand-accent',
        false: 'border-[color:var(--brand-divider)]',
      },
    },
    defaultVariants: { active: false },
  }
)
