import type { ChromeTheme } from '../../stores/theme.store'

export interface ThemeToggleButtonProps {
  theme: ChromeTheme
  onToggle: () => void
}

export const ThemeToggleButton = ({ theme, onToggle }: ThemeToggleButtonProps) => (
  <button
    type="button"
    onClick={onToggle}
    className="shell-theme-toggle cursor-pointer border-0 border-r-2 border-solid border-r-brand-divider bg-transparent px-4 font-sans text-[11px] font-extrabold tracking-[0.08em] text-brand-neutral-600"
    title={theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'}
  >
    {theme === 'dark' ? 'DAY' : 'NIGHT'}
  </button>
)
