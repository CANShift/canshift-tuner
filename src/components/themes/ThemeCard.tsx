import type { ThemeFace, ThemePresetEntry } from '@canshift/core'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { MetaText } from '../ui/meta-text'

export interface ThemeCardProps {
  entry: ThemePresetEntry
  active: boolean
  previewFace: 'night' | 'day'
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

const rampOf = (face: ThemeFace): string[] => {
  const palette = face.palette
  if (!palette) return [face.bgColor, trackColorFor(face.bgColor)]
  return [
    face.bgColor,
    palette.surface,
    trackColorFor(face.bgColor),
    palette.textDim,
    palette.danger,
    palette.accent,
  ]
}

export const ThemeCard = ({ entry, active, previewFace, onSelect }: ThemeCardProps) => {
  const face = entry.preset[previewFace]
  const palette = face.palette
  if (!palette) return null
  const otherFace = entry.preset[previewFace === 'night' ? 'day' : 'night']

  return (
    <button
      type="button"
      onClick={onSelect}
      title={`Use "${entry.label}" — its ${previewFace} face is showing, its other face follows the mode`}
      className={cn(card({ active }))}
    >
      <div className="flex w-full items-baseline gap-2.5 border-b-2 border-brand-divider px-3.5 py-3">
        <span className="text-[13px] font-extrabold text-brand-text">{entry.label}</span>
        <MetaText align="end" className={cn(active && 'text-brand-accent')}>
          {active ? `active — ${previewFace}` : entry.note}
        </MetaText>
      </div>
      <div
        className="flex h-[140px] w-full items-end gap-4 p-4 font-mono"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ background: face.bgColor, color: palette.text }}
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
        {rampOf(face).map((color, i) => (
          // eslint-disable-next-line no-inline-style/no-inline-style
          <div key={i} className="flex-1" style={{ background: color }} />
        ))}
      </div>
      <div className="flex h-[10px] w-full">
        {rampOf(otherFace).map((color, i) => (
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
