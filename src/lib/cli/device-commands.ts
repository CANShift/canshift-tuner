import { err, hex2, ok, out, NEEDS_DEVICE } from './context'
import type { CliCommand, CliContext } from './types'

const safeJson = (raw: string): Record<string, unknown> => {
  try {
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

const deviceCommand = (
  name: string,
  hint: string,
  run: (context: CliContext) => string
): CliCommand => ({
  name,
  hint,
  run: (context) => (context.hasDevice ? [ok(run(context))] : [NEEDS_DEVICE]),
})

export const SCAN = deviceCommand('scan', 'scan — listen to the bus', (context) => {
  context.actions.scan()
  return 'Scanning the bus.'
})

export const BURN = deviceCommand('burn', 'burn — write the config to the dash', (context) => {
  context.actions.burn()
  return 'Burning.'
})

export const OPCODES: CliCommand = {
  name: 'opcodes',
  hint: 'opcodes — list the raw firmware opcodes',
  run: (context) =>
    context.opcodes.map((opcode) =>
      out(
        `${hex2(opcode.id)}  ${opcode.name.replace(/^CMD_/, '').toLowerCase().padEnd(22)} ${opcode.description}`
      )
    ),
}

const sendRaw = (context: CliContext, opcode: number, body: string) => {
  void context.actions.raw(opcode, body.length > 0 ? safeJson(body) : {}).then(context.onAsync)
  return [out(`sending ${hex2(opcode)}…`)]
}

export const RAW: CliCommand = {
  name: 'raw',
  hint: 'raw <opcode> [json] — send a firmware opcode',
  run: (context, args) => {
    if (!context.hasDevice) return [NEEDS_DEVICE]
    const [opcodeToken, ...rest] = args
    const opcode = Number(opcodeToken)
    if (!Number.isInteger(opcode)) return [err('raw <opcode> [json] — opcode as 0x2A or 42.')]
    const body = rest.join(' ')
    if (body.length > 0 && !body.startsWith('{')) return [err('The payload has to be JSON.')]
    return sendRaw(context, opcode, body)
  },
}
