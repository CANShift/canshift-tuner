import type { DashboardConfig, SignalDef } from '@canshift/core'
import { describe, expect, it, vi } from 'vitest'
import { COMMAND_NAMES, findCommand, type CliActions, type CliContext } from './commands'
import { parseCommand, suggest } from './parse'

const actions = (): CliActions => ({
  raw: vi.fn(async () => ({ ok: true, text: '{}' })),
  selectPage: vi.fn(),
  setDefaultPage: vi.fn(),
  updateWidget: vi.fn(),
  updateSignal: vi.fn(),
  setTheme: vi.fn(),
  copyWidgets: vi.fn(),
  pasteWidgets: vi.fn(),
  undo: vi.fn(),
  save: vi.fn(),
  exportConfig: vi.fn(),
  importConfig: vi.fn(),
  burn: vi.fn(),
  scan: vi.fn(),
})

const config = (): DashboardConfig =>
  ({
    defaultPageId: 'page-1',
    pages: [
      {
        id: 'page-1',
        widgets: [
          {
            id: 'w1',
            type: 'gauge',
            signal: 'rpm',
            layout: { col: 0, colSpan: 6, row: 0, rowSpan: 3, zOrder: 0 },
          },
          {
            id: 'w2',
            type: 'gear',
            signal: 'gear',
            layout: { col: 6, colSpan: 6, row: 0, rowSpan: 3, zOrder: 0 },
          },
        ],
      },
      { id: 'page-2', widgets: [] },
    ],
  }) as unknown as DashboardConfig

const context = (overrides: Partial<CliContext> = {}): CliContext => ({
  config: config(),
  selectedPageId: 'page-1',
  signals: [{ name: 'rpm' }, { name: 'gear' }] as unknown as SignalDef[],
  hasDevice: true,
  opcodes: [{ id: 0x01, name: 'CMD_GET_CONFIG', description: 'Read dashboard JSON' }],
  onAsync: vi.fn(),
  actions: actions(),
  ...overrides,
})

const run = (line: string, ctx: CliContext) => {
  const invocation = parseCommand(line)
  if (invocation === null) throw new Error('unparsed')
  const command = findCommand(invocation.name)
  if (command === undefined) throw new Error(`unknown ${invocation.name}`)
  return command.run(ctx, invocation.args)
}

describe('parseCommand', () => {
  it('reads a slash command with arguments', () => {
    expect(parseCommand('/bind 1 rpm')).toEqual({ name: 'bind', args: ['1', 'rpm'] })
  })

  it('tolerates a missing slash and stray whitespace', () => {
    expect(parseCommand('  page   2  ')).toEqual({ name: 'page', args: ['2'] })
  })

  it('is null on an empty line rather than running something', () => {
    expect(parseCommand('   ')).toBeNull()
  })
})

describe('suggest', () => {
  it('offers every command on a bare slash', () => {
    expect(suggest('/', COMMAND_NAMES)).toEqual([...COMMAND_NAMES])
  })

  it('narrows on what is typed', () => {
    expect(suggest('/pa', COMMAND_NAMES)).toEqual(['page', 'paste'])
  })

  it('offers nothing until the slash is typed', () => {
    expect(suggest('pa', COMMAND_NAMES)).toEqual([])
  })
})

describe('commands', () => {
  it('/help lists every command, so the list cannot drift from the registry', () => {
    expect(run('/help', context())).toHaveLength(COMMAND_NAMES.length)
  })

  it('/ls lists the pages and marks the boot page', () => {
    const lines = run('/ls', context())
    expect(lines).toHaveLength(2)
    expect(lines[0]?.text).toContain('boot')
  })

  it('/ls <n> lists the widgets on that page', () => {
    const lines = run('/ls 1', context())
    expect(lines[0]?.text).toContain('gauge')
    expect(lines[1]?.text).toContain('gear')
  })

  it('/page selects by number and refuses one that does not exist', () => {
    const ctx = context()
    run('/page 2', ctx)
    expect(ctx.actions.selectPage).toHaveBeenCalledWith('page-2')
    expect(run('/page 9', ctx)[0]?.tone).toBe('error')
  })

  it('/bind takes a widget by index or by the signal it already carries', () => {
    const ctx = context()
    run('/bind 1 gear', ctx)
    expect(ctx.actions.updateWidget).toHaveBeenCalledWith('page-1', 'w1', { signal: 'gear' })
    run('/bind gear rpm', ctx)
    expect(ctx.actions.updateWidget).toHaveBeenCalledWith('page-1', 'w2', { signal: 'rpm' })
  })

  it('/bind warns when the signal is not in the profile, but still binds', () => {
    const ctx = context()
    const lines = run('/bind 1 nitrous', ctx)
    expect(ctx.actions.updateWidget).toHaveBeenCalled()
    expect(lines.some((line) => line.tone === 'error')).toBe(true)
  })

  it('/span refuses a column count the grid cannot hold', () => {
    const ctx = context()
    expect(run('/span 1 13', ctx)[0]?.tone).toBe('error')
    expect(ctx.actions.updateWidget).not.toHaveBeenCalled()
  })

  it('/theme names the presets when the one asked for does not exist', () => {
    const ctx = context()
    const lines = run('/theme nope', ctx)
    expect(lines[0]?.tone).toBe('error')
    expect(lines[1]?.text).toContain('rally')
    expect(ctx.actions.setTheme).not.toHaveBeenCalled()
  })

  it('refuses the device commands with no board instead of queueing them', () => {
    const ctx = context({ hasDevice: false })
    expect(run('/burn', ctx)[0]?.tone).toBe('error')
    expect(run('/scan', ctx)[0]?.tone).toBe('error')
    expect(ctx.actions.burn).not.toHaveBeenCalled()
    expect(ctx.actions.scan).not.toHaveBeenCalled()
  })

  it('says the critical alert has nowhere to go rather than pretending it worked', () => {
    expect(run('/alert', context())[0]?.tone).toBe('error')
  })
})
