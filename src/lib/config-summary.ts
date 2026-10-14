import type { DashboardConfig } from '@canshift/core'

const plural = (count: number, word: string): string =>
  `${String(count)} ${word}${count === 1 ? '' : 's'}`

export const summarizeConfig = (config: DashboardConfig | null): string => {
  if (config === null) return 'no config open'
  const widgets = config.pages.reduce((total, page) => total + page.widgets.length, 0)
  return `${plural(config.pages.length, 'page')} · ${plural(widgets, 'widget')}`
}
