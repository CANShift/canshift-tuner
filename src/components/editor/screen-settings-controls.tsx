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
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: Math.round(scale * 2.5),
        }}
      >
        <span style={{ fontSize: fs, color: SCREEN_LABEL, letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontSize: fs, color: SCREEN_VALUE }}>{value}</span>
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
    <div style={{ display: 'flex', gap: Math.round(scale * 3) }}>
      {options.map((option) => {
        const active = activeValue === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onSelect(option.value)
            }}
            style={{
              flex: 1,
              padding: `${String(Math.round(scale * 2))}px 0`,
              background: active ? ACCENT_RED_BG : BTN_BG,
              border: `1px solid ${active ? ACCENT_RED : BTN_BORDER}`,
              color: active ? ACCENT_RED : SCREEN_LABEL,
              fontSize: fs,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
