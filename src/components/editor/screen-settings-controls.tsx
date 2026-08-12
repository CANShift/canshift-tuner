import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export const SCREEN_BG = '#0D0D0D'
export const SCREEN_LABEL = '#AAAAAA'
export const SCREEN_VALUE = '#888888'
export const SCREEN_HEADER = '#CCCCCC'
export const BTN_BG = '#111111'
export const BTN_BORDER = '#2A2A2A'
export const BTN_BORDER_DIM = '#1E1E1E'
export const BTN_FG_DISABLED = '#444444'
export const ACCENT_RED = '#CC3333'
export const ACCENT_RED_BG = '#1A0A0A'

const ROW_LABEL = 'tracking-[0.06em] text-[#AAAAAA]'

const ROW_VALUE = 'text-[#888888]'

const segment = cva('flex-1 cursor-pointer border border-solid leading-none', {
  variants: {
    active: {
      true: 'border-[#CC3333] bg-[#1A0A0A] text-[#CC3333]',
      false: 'border-[#2A2A2A] bg-[#111111] text-[#AAAAAA]',
    },
  },
  defaultVariants: { active: false },
})

export interface SettingRowProps {
  label: string
  value: string
  scale: number
  children: ReactNode
}

export const SettingRow = ({ label, value, scale, children }: SettingRowProps) => {
  const fs = Math.round(scale * 5.5)

  return (
    <div>
      <div
        className="flex justify-between"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ marginBottom: Math.round(scale * 2.5) }}
      >
        {/* eslint-disable-next-line no-inline-style/no-inline-style */}
        <span className={ROW_LABEL} style={{ fontSize: fs }}>
          {label}
        </span>
        {/* eslint-disable-next-line no-inline-style/no-inline-style */}
        <span className={ROW_VALUE} style={{ fontSize: fs }}>
          {value}
        </span>
      </div>
      {children}
    </div>
  )
}

export interface SegmentedOption<T extends string | number> {
  value: T
  label: string
}

export interface SegmentedPairProps<T extends string | number> {
  options: readonly SegmentedOption<T>[]
  activeValue: T
  scale: number
  onSelect: (value: T) => void
}

export const SegmentedPair = <T extends string | number>({
  options,
  activeValue,
  scale,
  onSelect,
}: SegmentedPairProps<T>) => {
  const fs = Math.round(scale * 6)

  return (
    // eslint-disable-next-line no-inline-style/no-inline-style
    <div className="flex" style={{ gap: Math.round(scale * 3) }}>
      {options.map((option) => {
        const active = activeValue === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onSelect(option.value)
            }}
            className={cn(segment({ active }))}
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ padding: `${String(Math.round(scale * 2))}px 0`, fontSize: fs }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
