import { err, ok, out, NO_CONFIG, pageAt } from './context'
import type { CliCommand, CliContext } from './types'
import type { PageConfig, Widget } from '@canshift/core'

const plural = (count: number, word: string): string =>
  `${String(count)} ${word}${count === 1 ? '' : 's'}`

const pageLine = (page: PageConfig, index: number, bootId: string | undefined) =>
  out(
    `${String(index + 1).padStart(2, '0')}  ${plural(page.widgets.length, 'widget')}${page.id === bootId ? '  · boot' : ''}`
  )

const widgetLine = (widget: Widget, index: number) =>
  out(`${String(index + 1).padStart(2, '0')}  ${widget.type.padEnd(12)} ${widget.signal || '—'}`)

const listWidgets = (context: CliContext, token: string | undefined) => {
  const page = pageAt(context, token)
  if (page === null) return [err(`No page ${String(token)}.`)]
  if (page.widgets.length === 0) return [out('(no widgets)')]
  return page.widgets.map(widgetLine)
}

export const LS: CliCommand = {
  name: 'ls',
  hint: 'list pages, or the widgets on one',
  run: (context, args) => {
    const config = context.config
    if (config === null) return [NO_CONFIG]
    if (args.length > 0) return listWidgets(context, args[0])
    return config.pages.map((page, index) => pageLine(page, index, config.defaultPageId))
  },
}

export const PAGE: CliCommand = {
  name: 'page',
  hint: 'page <n> — edit that page',
  run: (context, args) => {
    const page = pageAt(context, args[0])
    if (page === null) return [err(`No page ${String(args[0] ?? '')}.`)]
    context.actions.selectPage(page.id)
    return [ok(`Editing page ${String(args[0])}.`)]
  },
}

export const BOOT: CliCommand = {
  name: 'boot',
  hint: 'boot <n> — boot the dash on that page',
  run: (context, args) => {
    const page = pageAt(context, args[0])
    if (page === null) return [err(`No page ${String(args[0] ?? '')}.`)]
    context.actions.setDefaultPage(page.id)
    return [ok(`Page ${String(args[0])} boots the dash.`)]
  },
}
