import type { CSSProperties, ReactNode } from 'react'
import type { ThemePreset } from '@canshift/core'
import { MONO_FONT } from '../../lib/typography'
import { Eyebrow } from '../ui/meta-text'

export interface ThemeTokensRailProps {
  title: string
  preset: ThemePreset
  children: ReactNode
}

export const ThemeTokensRail = ({ title, preset, children }: ThemeTokensRailProps) => {
  const palette = preset.palette
  const tokens: [string, string][] = [
    ['bg', preset.bgColor],
    ...(palette
      ? ([
          ['surface', palette.surface],
          ['primary', palette.primary],
          ['accent', palette.accent],
          ['text', palette.text],
          ['textDim', palette.textDim],
          ['warning', palette.warning],
          ['danger', palette.danger],
          ['success', palette.success],
        ] as [string, string][])
      : []),
  ]

  return (
    <aside style={railStyle}>
      <Eyebrow>{title}</Eyebrow>
      <div style={tokenListStyle}>
        {tokens.map(([name, value]) => (
          <div key={name} style={tokenRowStyle}>
            <span style={swatchStyle(value)} />
            <span style={tokenNameStyle}>{name}</span>
            <span style={tokenValueStyle}>{value}</span>
          </div>
        ))}
      </div>
      <Eyebrow>AUTO DAY / NIGHT</Eyebrow>
      {children}
    </aside>
  )
}

const railStyle: CSSProperties = {
  width: 320,
  flexShrink: 0,
  borderLeft: '2px solid var(--brand-divider)',
  background: 'hsl(var(--brand-neutral-100))',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  overflowY: 'auto',
}

const tokenListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 9,
}

const tokenRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: MONO_FONT,
  fontSize: 12,
}

const swatchStyle = (color: string): CSSProperties => ({
  width: 12,
  height: 12,
  flexShrink: 0,
  background: color,
  border: '1px solid hsl(var(--brand-neutral-300))',
})

const tokenNameStyle: CSSProperties = {
  color: 'hsl(var(--brand-neutral-700))',
}

const tokenValueStyle: CSSProperties = {
  marginLeft: 'auto',
  color: 'hsl(var(--brand-neutral-600))',
}
