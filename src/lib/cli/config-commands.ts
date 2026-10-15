import { THEME_PRESETS } from '@canshift/core'
import { err, ok, out } from './context'
import type { CliActions, CliCommand } from './types'

export const ID: CliCommand = {
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

export const THEME: CliCommand = {
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

export const ALERT: CliCommand = {
  name: 'alert',
  hint: 'alert — show the critical alert (set it under DEVICE)',
  run: (context) => {
    const alert = context.config?.criticalAlert
    if (alert === undefined) return [out('No critical alert. Set one under DEVICE.')]
    return [
      out(
        `${alert.signal} ${alert.direction} ${String(alert.firesAt)} takes the screen until acknowledged on the ${alert.acknowledgeOn}.`
      ),
    ]
  },
}

const actionCommand = (
  name: string,
  hint: string,
  action: keyof Pick<CliActions, 'undo' | 'save' | 'exportConfig' | 'importConfig'>,
  reply: string
): CliCommand => ({
  name,
  hint,
  run: (context) => {
    context.actions[action]()
    return [ok(reply)]
  },
})

export const UNDO = actionCommand('undo', 'undo — step back one change', 'undo', 'Undone.')
export const SAVE = actionCommand(
  'save',
  'save — write the config to this browser',
  'save',
  'Saved.'
)
export const EXPORT = actionCommand(
  'export',
  'export — download a .canshift file',
  'exportConfig',
  'Exported.'
)
export const IMPORT = actionCommand(
  'import',
  'import — open a .canshift file',
  'importConfig',
  'Pick a file.'
)
