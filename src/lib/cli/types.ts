import type { DashboardConfig, SignalDef, ThemePreset, Widget } from '@canshift/core'

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
