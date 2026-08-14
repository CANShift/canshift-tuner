import type { BurnChunkPosition } from '../transport/types'
import { humanizeTransportError } from '../transport/humanize-transport-error'

export type BurnFailureStage = 'push' | 'verify'

export type BurnFailureOrigin = 'editor' | 'link' | 'dash'

export interface BurnFailureInput {
  stage: BurnFailureStage
  command: string
  code: string
  chunk?: BurnChunkPosition | undefined
}

export interface BurnFailure {
  kicker: string
  code: string
  title: string
  body: string
}

interface StageCopy {
  title: string
  reassurance: string
}

interface Reason {
  text: string
  origin: BurnFailureOrigin
}

const EDITOR_KICKER_SOURCE = 'TUNER'

const UNCONFIRMED_REASSURANCE =
  'The write stopped part-way — read the dash back before you trust the editor.'

const STORED_REASSURANCE =
  'The dash is still running on whatever it stored — read it back before you trust the editor.'

const COPY: Record<BurnFailureStage, Record<BurnFailureOrigin, StageCopy>> = {
  push: {
    editor: {
      title: 'The burn never left the tuner',
      reassurance: 'Nothing was written to any dash.',
    },
    link: {
      title: 'The dash never confirmed the write',
      reassurance: UNCONFIRMED_REASSURANCE,
    },
    dash: {
      title: 'The dash rejected the write',
      reassurance: 'The dash kept its previous config and is still running.',
    },
  },
  verify: {
    editor: { title: 'The write could not be confirmed', reassurance: STORED_REASSURANCE },
    link: { title: 'The write could not be confirmed', reassurance: STORED_REASSURANCE },
    dash: { title: 'The dash did not keep the write', reassurance: STORED_REASSURANCE },
  },
}

const REASONS: Record<string, Reason> = {
  E_CRC: { text: 'Checksum mismatch', origin: 'dash' },
  ACK_TIMEOUT: { text: 'The dash stopped acknowledging', origin: 'link' },
  CHUNK_REJECTED: { text: 'The dash rejected a chunk', origin: 'dash' },
  DEVICE_ERROR: { text: 'The dash reported an error', origin: 'dash' },
  QUEUE_FULL: { text: 'The dash was busy with another command', origin: 'dash' },
  SEND_FAILED: { text: 'The write never reached the dash', origin: 'editor' },
  CONNECTION_CLOSED: { text: 'The connection closed mid-write', origin: 'link' },
  DISCONNECTED: { text: 'The dash disconnected mid-write', origin: 'link' },
  NOT_CONNECTED: { text: 'No dash was connected', origin: 'editor' },
  EMPTY_CONFIG: { text: 'The config serialised to nothing', origin: 'editor' },
  INVALID_CONFIG: { text: 'The editor rejected the config before sending it', origin: 'editor' },
  EXCEPTION: { text: 'The write threw before the dash answered', origin: 'link' },
  UNKNOWN_ERROR: { text: 'The dash reported an error', origin: 'dash' },
  UNREACHABLE: { text: 'The dash stopped answering after the write', origin: 'link' },
  FETCH_FAILED: { text: 'The config could not be read back', origin: 'link' },
  MISMATCH: { text: 'The config read back does not match the editor', origin: 'dash' },
}

const UNKNOWN_REASON_ORIGIN: BurnFailureOrigin = 'link'

const sentence = (text: string): string => (text.endsWith('.') ? text : `${text}.`)

const chunkClause = (chunk: BurnChunkPosition): string =>
  `on chunk ${String(chunk.index)} of ${String(chunk.total)}`

const knownSentence = (reason: Reason, chunk: BurnChunkPosition | undefined): string =>
  chunk === undefined ? sentence(reason.text) : sentence(`${reason.text} ${chunkClause(chunk)}`)

const unknownSentence = (rawCode: string, chunk: BurnChunkPosition | undefined): string => {
  const humanized = sentence(humanizeTransportError(rawCode))
  return chunk === undefined ? humanized : `${humanized} It stopped ${chunkClause(chunk)}.`
}

const reasonSentence = (
  reason: Reason | undefined,
  rawCode: string,
  chunk: BurnChunkPosition | undefined
): string => (reason === undefined ? unknownSentence(rawCode, chunk) : knownSentence(reason, chunk))

export const describeBurnFailure = ({
  stage,
  command,
  code,
  chunk,
}: BurnFailureInput): BurnFailure => {
  const normalized = code.toUpperCase()
  const reason = REASONS[normalized]
  const origin = reason?.origin ?? UNKNOWN_REASON_ORIGIN
  const copy = COPY[stage][origin]
  const source = origin === 'editor' ? EDITOR_KICKER_SOURCE : command
  return {
    kicker: `${source} · ${normalized}`,
    code: normalized,
    title: copy.title,
    body: `${reasonSentence(reason, code, chunk)} ${copy.reassurance}`,
  }
}
