import type { ReactNode } from 'react'
import type { ThemePreset } from '@canshift/core'
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
    <aside className="flex w-[320px] shrink-0 flex-col gap-[18px] overflow-y-auto border-l-2 border-brand-divider bg-brand-neutral-100 p-5">
      <Eyebrow>{title}</Eyebrow>
      <div className="flex flex-col gap-[9px]">
        {tokens.map(([name, value]) => (
          <div key={name} className="flex items-center gap-2.5 font-mono text-[12px]">
            <span
              className="size-3 shrink-0 border border-brand-neutral-300"
              // eslint-disable-next-line no-inline-style/no-inline-style
              style={{ background: value }}
            />
            <span className="text-brand-neutral-700">{name}</span>
            <span className="ml-auto text-brand-neutral-600">{value}</span>
          </div>
        ))}
      </div>
      <Eyebrow>AUTO DAY / NIGHT</Eyebrow>
      {children}
    </aside>
  )
}
