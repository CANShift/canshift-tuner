import type { PageConfig, Widget } from '@canshift/core'
import type { CliContext, CliLine } from './types'

export const out = (text: string): CliLine => ({ tone: 'out', text })
export const ok = (text: string): CliLine => ({ tone: 'ok', text })
export const err = (text: string): CliLine => ({ tone: 'error', text })

export const NO_CONFIG = err('No config open. Connect the dash or edit offline.')
export const NEEDS_DEVICE = err('That needs a dash. Plug one in — simulation cannot answer for it.')

export const currentPage = (context: CliContext): PageConfig | null => {
  const pages = context.config?.pages ?? []
  return pages.find((page) => page.id === context.selectedPageId) ?? pages[0] ?? null
}

export const pageAt = (context: CliContext, token: string | undefined): PageConfig | null => {
  const pages = context.config?.pages ?? []
  const index = Number(token)
  if (!Number.isInteger(index) || index < 1 || index > pages.length) return null
  return pages[index - 1] ?? null
}

const widgetAt = (page: PageConfig, token: string | undefined): Widget | null => {
  const index = Number(token)
  if (Number.isInteger(index) && index >= 1 && index <= page.widgets.length) {
    return page.widgets[index - 1] ?? null
  }
  const lower = (token ?? '').toLowerCase()
  return page.widgets.find((widget) => widget.signal.toLowerCase() === lower) ?? null
}

export const withWidget = (
  context: CliContext,
  token: string | undefined,
  run: (page: PageConfig, widget: Widget) => CliLine[]
): CliLine[] => {
  const page = currentPage(context)
  if (page === null) return [NO_CONFIG]
  const widget = widgetAt(page, token)
  if (widget === null) return [err(`No widget ${String(token ?? '')} on this page.`)]
  return run(page, widget)
}

export const hex2 = (value: number): string =>
  `0x${value.toString(16).toUpperCase().padStart(2, '0')}`
