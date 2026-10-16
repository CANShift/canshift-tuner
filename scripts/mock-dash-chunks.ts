import { fail, ok, okThenReboot, type Command, type Outcome } from './mock-dash-replies'
import type { MockDashState } from './mock-dash-state'

const parseUpload = (parts: readonly Buffer[]): unknown => {
  try {
    return JSON.parse(Buffer.concat(parts).toString('utf8')) as unknown
  } catch {
    return null
  }
}

const startUpload = (command: Command, state: MockDashState): void => {
  if (command.idx !== 0) return
  state.upload = { total: Number(command.total), parts: [] }
}

const commitUpload = (state: MockDashState, parts: readonly Buffer[]): Outcome => {
  state.upload = null
  const config = parseUpload(parts)
  if (config === null) return fail('invalid_config')
  state.config = config
  return ok()
}

export const putConfigChunk = (command: Command, state: MockDashState): Outcome => {
  startUpload(command, state)
  const upload = state.upload
  if (upload === null || typeof command.data !== 'string') return fail('chunk_out_of_order')
  upload.parts.push(Buffer.from(command.data, 'base64'))
  const isLast = Number(command.idx) === upload.total - 1
  return isLast ? commitUpload(state, upload.parts) : ok()
}

const SIGNALS_PATH = '/config/signals.json'

const commitFile = (command: Command, state: MockDashState, parts: readonly Buffer[]): Outcome => {
  state.upload = null
  if (command.path !== SIGNALS_PATH) return ok()
  const file = parseUpload(parts) as { signals?: unknown } | null
  if (file === null || !Array.isArray(file.signals)) return fail('invalid_signals')
  return okThenReboot({ rebooting: true })
}

export const putFileChunk = (command: Command, state: MockDashState): Outcome => {
  startUpload(command, state)
  const upload = state.upload
  if (upload === null || typeof command.data !== 'string') return fail('out_of_sequence')
  upload.parts.push(Buffer.from(command.data, 'base64'))
  const isLast = Number(command.idx) === upload.total - 1
  return isLast ? commitFile(command, state, upload.parts) : ok()
}
