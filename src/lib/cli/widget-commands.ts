import { LAYOUT_GRID } from '@canshift/core'
import { err, ok, NO_CONFIG, currentPage, withWidget } from './context'
import type { CliCommand } from './types'

export const BIND: CliCommand = {
  name: 'bind',
  hint: 'bind <widget> <signal> — bind a widget on this page',
  run: (context, args) =>
    withWidget(context, args[0], (page, widget) => {
      const signal = args[1]
      if (signal === undefined) return [err('bind <widget> <signal>')]
      const known = context.signals.some((entry) => entry.name === signal)
      context.actions.updateWidget(page.id, widget.id, { signal })
      const warning = err(`${signal} is not in the profile — the widget will render blank.`)
      return [ok(`${widget.type} bound to ${signal}.`), ...(known ? [] : [warning])]
    }),
}

const isColumnSpan = (columns: number): boolean =>
  Number.isInteger(columns) && columns >= 1 && columns <= LAYOUT_GRID.COLUMNS

export const SPAN: CliCommand = {
  name: 'span',
  hint: 'span <widget> <columns> — resize in whole columns',
  run: (context, args) =>
    withWidget(context, args[0], (page, widget) => {
      const columns = Number(args[1])
      if (!isColumnSpan(columns))
        return [err(`Columns must be 1 to ${String(LAYOUT_GRID.COLUMNS)}.`)]
      context.actions.updateWidget(page.id, widget.id, {
        layout: { ...widget.layout, colSpan: columns },
      })
      return [ok(`${widget.type} spans ${String(columns)} columns.`)]
    }),
}

export const TYPE: CliCommand = {
  name: 'type',
  hint: 'type <widget> <kind> — change a widget kind',
  run: (context, args) =>
    withWidget(context, args[0], (_page, widget) => [
      err(
        `Changing a widget kind rewrites its config; do it from the widget list. ${widget.type} left alone.`
      ),
    ]),
}

export const COPY: CliCommand = {
  name: 'copy',
  hint: 'copy <widget> — copy a widget on this page',
  run: (context, args) =>
    withWidget(context, args[0], (page, widget) => {
      context.actions.copyWidgets(page.id, [widget.id])
      return [ok(`Copied ${widget.type}.`)]
    }),
}

export const PASTE: CliCommand = {
  name: 'paste',
  hint: 'paste — paste onto this page',
  run: (context) => {
    const page = currentPage(context)
    if (page === null) return [NO_CONFIG]
    context.actions.pasteWidgets(page.id)
    return [ok('Pasted.')]
  },
}
