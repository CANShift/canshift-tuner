export type Command = Record<string, unknown> & { cmd: number }
export type Reply = Record<string, unknown>

export interface Outcome {
  reply: Reply
  reboot: boolean
}

export const ok = (fields: Reply = {}): Outcome => ({
  reply: { status: 'ok', ...fields },
  reboot: false,
})

export const okThenReboot = (fields: Reply = {}): Outcome => ({ ...ok(fields), reboot: true })

export const fail = (message: string): Outcome => ({
  reply: { status: 'error', message },
  reboot: false,
})
