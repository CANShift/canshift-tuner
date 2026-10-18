import { THEME_PRESETS } from '@canshift/core'
import type { ThemePreset } from '@canshift/core'
import { ThemeSampleCard } from './ThemeSampleCard'

export interface ThemePresetGridProps {
  activeTheme: ThemePreset
  face: 'day' | 'night'
  onSelect: (preset: ThemePreset) => void
}

const samePreset = (a: ThemePreset | undefined, b: ThemePreset): boolean =>
  a !== undefined && JSON.stringify(a) === JSON.stringify(b)

export const ThemePresetGrid = ({ activeTheme, face, onSelect }: ThemePresetGridProps) => (
  <div className="mt-3 grid font-sans gap-px [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
    {THEME_PRESETS.map((entry) => (
      <ThemeSampleCard
        key={entry.id}
        entry={entry}
        face={face}
        active={samePreset(activeTheme, entry.preset)}
        onSelect={() => {
          onSelect(entry.preset)
        }}
      />
    ))}
  </div>
)
