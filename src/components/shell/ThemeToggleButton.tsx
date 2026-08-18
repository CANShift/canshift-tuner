import type { ChromeTheme } from '../../stores/theme.store'

export interface ThemeToggleButtonProps {
  theme: ChromeTheme
  onToggle: () => void
}

export const ThemeToggleButton = ({ theme, onToggle }: ThemeToggleButtonProps) => (
  <button
    type="button"
    onClick={onToggle}
    className="cursor-pointer whitespace-nowrap border-0 border-l border-solid border-ui-header-line bg-transparent px-3 font-mono text-[11px] tracking-[0.14em] text-ui-header-dim hover:text-ui-header-ink"
    title="Switch the Tuner theme"
  >
    {theme === 'dark' ? 'LIGHT' : 'DARK'}
  </button>
)
