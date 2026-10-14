import { createHash } from 'node:crypto'
import { fail, ok, okThenReboot, type Command, type Outcome } from './mock-dash-replies'
import type { MockDashState, OtaSession } from './mock-dash-state'

const SLOT_BYTES = 0x300000
const ESP_IMAGE_MAGIC = 0xe9
const APP_DESC_MAGIC = 0xabcd5432
const APP_DESC_OFFSET = 0x20
const APP_VERSION_OFFSET = APP_DESC_OFFSET + 16
const APP_TEXT_BYTES = 32
const SHA256_HEX = /^[0-9a-f]{64}$/i

const failWritten = (message: string, written: number): Outcome => {
  const outcome = fail(message)
  return { ...outcome, reply: { ...outcome.reply, written } }
}

const isAppImage = (image: Buffer): boolean =>
  image[0] === ESP_IMAGE_MAGIC && image.readUInt32LE(APP_DESC_OFFSET) === APP_DESC_MAGIC

const imageVersion = (image: Buffer): string => {
  const field = image.subarray(APP_VERSION_OFFSET, APP_VERSION_OFFSET + APP_TEXT_BYTES)
  const end = field.indexOf(0)
  return field.subarray(0, end === -1 ? field.length : end).toString('utf8')
}

export const otaBegin = (command: Command, state: MockDashState): Outcome => {
  const total = Number(command.total)
  const sha256 = String(command.sha256 ?? '')
  if (!(total > 0) || !SHA256_HEX.test(sha256)) return fail('bad_args')
  if (total > SLOT_BYTES) return fail('size_out_of_range')
  state.ota = { total, sha256: sha256.toLowerCase(), parts: [], written: 0 }
  return ok()
}

const chunkProblem = (session: OtaSession, offset: number, bytes: Buffer): string | null => {
  if (bytes.length === 0) return 'empty_chunk'
  if (offset !== session.written) return 'offset_mismatch'
  if (session.written + bytes.length > session.total) return 'overrun'
  const startsImage = offset === 0 && bytes.length > APP_DESC_OFFSET + 4
  return startsImage && !isAppImage(bytes) ? 'not_app_image' : null
}

export const otaWrite = (command: Command, state: MockDashState): Outcome => {
  const session = state.ota
  if (session === null) return failWritten('not_receiving', 0)
  const bytes = Buffer.from(String(command.data ?? ''), 'base64')
  const problem = chunkProblem(session, Number(command.offset), bytes)
  if (problem !== null) return failWritten(problem, session.written)
  session.parts.push(bytes)
  session.written += bytes.length
  return ok({ written: session.written })
}

const commit = (session: OtaSession, state: MockDashState): Outcome => {
  if (session.written !== session.total) return fail('incomplete')
  const image = Buffer.concat(session.parts)
  const actual = createHash('sha256').update(image).digest('hex')
  if (actual !== session.sha256) return fail('sha256_mismatch')
  state.firmwareVersion = imageVersion(image)
  return okThenReboot({ restart: true })
}

export const otaEnd = (command: Command, state: MockDashState): Outcome => {
  const session = state.ota
  state.ota = null
  if (command.action !== 'commit') return ok()
  return session === null ? fail('not_receiving') : commit(session, state)
}
