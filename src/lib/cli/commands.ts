import type { DashboardConfig, PageConfig, SignalDef, ThemePreset, Widget } from '@canshift/core'
import { LAYOUT_GRID, THEME_PRESETS } from '@canshift/core'

export type CliTone = 'out' | 'ok' | 'error'

export interface CliLine {
  tone: CliTone
  text: string
}

export interface RawResult {
  ok: boolean
  text: string
}

export interface CliActions {
  raw: (opcode: number, fields: Record<string, unknown>) => Promise<RawResult>
  selectPage: (pageId: string) => void
  setDefaultPage: (pageId: string) => void
  updateWidget: (pageId: string, widgetId: string, patch: Partial<Widget>) => void
  updateSignal: (name: string, patch: Partial<SignalDef>) => void
  setTheme: (theme: ThemePreset) => void
  copyWidgets: (pageId: string, widgetIds: string[]) => void
  pasteWidgets: (pageId: string) => void
  undo: () => void
  save: () => void
  exportConfig: () => void
  importConfig: () => void
  burn: () => void
  scan: () => void
}

export interface KnownOpcode {
  id: number
  name: string
  description: string
}

export interface CliContext {
  config: DashboardConfig | null
  selectedPageId: string | null
  signals: readonly SignalDef[]
  hasDevice: boolean
  opcodes: readonly KnownOpcode[]
  actions: CliActions
  onAsync: (result: RawResult) => void
}

export interface CliCommand {
  name: string
  hint: string
  run: (context: CliContext, args: string[]) => CliLine[]
}

const out = (text: string): CliLine => ({ tone: 'out', text })
const ok = (text: string): CliLine => ({ tone: 'ok', text })
const err = (text: string): CliLine => ({ tone: 'error', text })

const safeJson = (raw: string): Record<string, unknown> => {
  try {
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

const NO_CONFIG = err('No config open. Start one from HOME.')
const NEEDS_DEVICE = err('That needs a dash. Plug one in — simulation cannot answer for it.')

const currentPage = (context: CliContext): PageConfig | null => {
  const pages = context.config?.pages ?? []
  return pages.find((page) => page.id === context.selectedPageId) ?? pages[0] ?? null
}

const pageAt = (context: CliContext, token: string | undefined): PageConfig | null => {
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

const widgetLabel = (widget: Widget, index: number): string =>
  `${String(index + 1).padStart(2, '0')}  ${widget.type.padEnd(12)} ${widget.signal || '—'}`

const HELP: CliCommand = {
  name: 'help',
  hint: 'list every command',
  run: () => COMMANDS.map((command) => out(`/${command.name.padEnd(8)} ${command.hint}`)),
}

const LS: CliCommand = {
  name: 'ls',
  hint: 'list pages, or the widgets on one',
  run: (context, args) => {
    if (context.config === null) return [NO_CONFIG]
    if (args.length === 0) {
      return context.config.pages.map((page, index) =>
        out(
          `${String(index + 1).padStart(2, '0')}  ${page.widgets.length} widget${page.widgets.length === 1 ? '' : 's'}${page.id === context.config?.defaultPageId ? '  · boot' : ''}`
        )
      )
    }
    const page = pageAt(context, args[0])
    if (page === null) return [err(`No page ${String(args[0])}.`)]
    if (page.widgets.length === 0) return [out('(no widgets)')]
    return page.widgets.map((widget, index) => out(widgetLabel(widget, index)))
  },
}

const PAGE: CliCommand = {
  name: 'page',
  hint: 'page <n> — edit that page',
  run: (context, args) => {
    const page = pageAt(context, args[0])
    if (page === null) return [err(`No page ${String(args[0] ?? '')}.`)]
    context.actions.selectPage(page.id)
    return [ok(`Editing page ${String(args[0])}.`)]
  },
}

const BOOT: CliCommand = {
  name: 'boot',
  hint: 'boot <n> — boot the dash on that page',
  run: (context, args) => {
    const page = pageAt(context, args[0])
    if (page === null) return [err(`No page ${String(args[0] ?? '')}.`)]
    context.actions.setDefaultPage(page.id)
    return [ok(`Page ${String(args[0])} boots the dash.`)]
  },
}

const BIND: CliCommand = {
  name: 'bind',
  hint: 'bind <widget> <signal> — bind a widget on this page',
  run: (context, args) => {
    const page = currentPage(context)
    if (page === null) return [NO_CONFIG]
    const widget = widgetAt(page, args[0])
    if (widget === null) return [err(`No widget ${String(args[0] ?? '')} on this page.`)]
    const signal = args[1]
    if (signal === undefined) return [err('bind <widget> <signal>')]
    const known = context.signals.some((entry) => entry.name === signal)
    context.actions.updateWidget(page.id, widget.id, { signal })
    return [
      ok(`${widget.type} bound to ${signal}.`),
      ...(known ? [] : [err(`${signal} is not in the profile — the widget will render blank.`)]),
    ]
  },
}

const SPAN: CliCommand = {
  name: 'span',
  hint: 'span <widget> <columns> — resize in whole columns',
  run: (context, args) => {
    const page = currentPage(context)
    if (page === null) return [NO_CONFIG]
    const widget = widgetAt(page, args[0])
    if (widget === null) return [err(`No widget ${String(args[0] ?? '')} on this page.`)]
    const columns = Number(args[1])
    if (!Number.isInteger(columns) || columns < 1 || columns > LAYOUT_GRID.COLUMNS) {
      return [err(`Columns must be 1 to ${String(LAYOUT_GRID.COLUMNS)}.`)]
    }
    context.actions.updateWidget(page.id, widget.id, {
      layout: { ...widget.layout, colSpan: columns },
    })
    return [ok(`${widget.type} spans ${String(columns)} columns.`)]
  },
}

const TYPE: CliCommand = {
  name: 'type',
  hint: 'type <widget> <kind> — change a widget kind',
  run: (context, args) => {
    const page = currentPage(context)
    if (page === null) return [NO_CONFIG]
    const widget = widgetAt(page, args[0])
    if (widget === null) return [err(`No widget ${String(args[0] ?? '')} on this page.`)]
    return [
      err(
        `Changing a widget kind rewrites its config; do it from the widget list. ${widget.type} left alone.`
      ),
    ]
  },
}

const ID: CliCommand = {
  name: 'id',
  hint: 'id <signal> <can-id> — set a signal frame id',
  run: (context, args) => {
    const [name, frameId] = args
    if (name === undefined || frameId === undefined) return [err('id <signal> <can-id>')]
    if (!context.signals.some((entry) => entry.name === name)) {
      return [err(`${name} is not in the profile.`)]
    }
    context.actions.updateSignal(name, { canFrameId: frameId })
    return [ok(`${name} reads from ${frameId}.`)]
  },
}

const THEME: CliCommand = {
  name: 'theme',
  hint: 'theme <name> — apply a dash theme',
  run: (context, args) => {
    const wanted = (args[0] ?? '').toLowerCase()
    const entry = THEME_PRESETS.find((preset) => preset.id.toLowerCase() === wanted)
    if (!entry) {
      return [
        err(`No theme "${String(args[0] ?? '')}".`),
        out(`Themes: ${THEME_PRESETS.map((preset) => preset.id).join(', ')}`),
      ]
    }
    context.actions.setTheme(entry.preset)
    return [ok(`Theme set to ${entry.label}.`)]
  },
}

const ALERT: CliCommand = {
  name: 'alert',
  hint: 'alert — the critical alert (not in the schema yet)',
  run: () => [
    err('The critical alert has no home in the config yet — CANShift/canshift-core#127.'),
  ],
}

const COPY: CliCommand = {
  name: 'copy',
  hint: 'copy <widget> — copy a widget on this page',
  run: (context, args) => {
    const page = currentPage(context)
    if (page === null) return [NO_CONFIG]
    const widget = widgetAt(page, args[0])
    if (widget === null) return [err(`No widget ${String(args[0] ?? '')} on this page.`)]
    context.actions.copyWidgets(page.id, [widget.id])
    return [ok(`Copied ${widget.type}.`)]
  },
}

const PASTE: CliCommand = {
  name: 'paste',
  hint: 'paste — paste onto this page',
  run: (context) => {
    const page = currentPage(context)
    if (page === null) return [NO_CONFIG]
    context.actions.pasteWidgets(page.id)
    return [ok('Pasted.')]
  },
}

const UNDO: CliCommand = {
  name: 'undo',
  hint: 'undo — step back one change',
  run: (context) => {
    context.actions.undo()
    return [ok('Undone.')]
  },
}

const SCAN: CliCommand = {
  name: 'scan',
  hint: 'scan — listen to the bus',
  run: (context) => {
    if (!context.hasDevice) return [NEEDS_DEVICE]
    context.actions.scan()
    return [ok('Scanning the bus.')]
  },
}

const SAVE: CliCommand = {
  name: 'save',
  hint: 'save — write the config to this browser',
  run: (context) => {
    context.actions.save()
    return [ok('Saved.')]
  },
}

const EXPORT: CliCommand = {
  name: 'export',
  hint: 'export — download a .canshift file',
  run: (context) => {
    context.actions.exportConfig()
    return [ok('Exported.')]
  },
}

const IMPORT: CliCommand = {
  name: 'import',
  hint: 'import — open a .canshift file',
  run: (context) => {
    context.actions.importConfig()
    return [ok('Pick a file.')]
  },
}

const OPCODES: CliCommand = {
  name: 'opcodes',
  hint: 'opcodes — list the raw firmware opcodes',
  run: (context) =>
    context.opcodes.map((opcode) =>
      out(
        `0x${opcode.id.toString(16).toUpperCase().padStart(2, '0')}  ${opcode.name.replace(/^CMD_/, '').toLowerCase().padEnd(22)} ${opcode.description}`
      )
    ),
}

const RAW: CliCommand = {
  name: 'raw',
  hint: 'raw <opcode> [json] — send a firmware opcode',
  run: (context, args) => {
    if (!context.hasDevice) return [NEEDS_DEVICE]
    const [opcodeToken, ...rest] = args
    const opcode = Number(opcodeToken)
    if (!Number.isInteger(opcode)) return [err('raw <opcode> [json] — opcode as 0x2A or 42.')]
    const body = rest.join(' ')
    if (body.length > 0 && !body.startsWith('{')) return [err('The payload has to be JSON.')]
    void context.actions.raw(opcode, body.length > 0 ? safeJson(body) : {}).then(context.onAsync)
    return [out(`sending 0x${opcode.toString(16).toUpperCase().padStart(2, '0')}…`)]
  },
}

const BURN: CliCommand = {
  name: 'burn',
  hint: 'burn — write the config to the dash',
  run: (context) => {
    if (!context.hasDevice) return [NEEDS_DEVICE]
    context.actions.burn()
    return [ok('Burning.')]
  },
}

export const COMMANDS: readonly CliCommand[] = [
  HELP,
  OPCODES,
  RAW,
  LS,
  PAGE,
  BOOT,
  BIND,
  SPAN,
  TYPE,
  ID,
  THEME,
  ALERT,
  COPY,
  PASTE,
  UNDO,
  SCAN,
  SAVE,
  EXPORT,
  IMPORT,
  BURN,
]

export const COMMAND_NAMES: readonly string[] = COMMANDS.map((command) => command.name)

export const findCommand = (name: string): CliCommand | undefined =>
  COMMANDS.find((command) => command.name === name)
