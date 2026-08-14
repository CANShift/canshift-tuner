import type { BurnChunkPosition } from '../transport/types'
import { humanizeTransportError } from '../transport/humanize-transport-error'

export type BurnFailureStage = 'push' | 'verify'

export interface BurnFailureInput {
  stage: BurnFailureStage
  command: string
  code: string
  chunk?: BurnChunkPosition | undefined
}

export interface BurnFailure {
  command: string
  code: string
  title: string
  body: string
}

interface StageCopy {
  title: string
  reassurance: string
}

const STAGE_COPY: Record<BurnFailureStage, StageCopy> = {
  push: {
    title: 'The dash rejected the write',
    reassurance: 'The dash kept its previous config and is still running.',
  },
  verify: {
    title: 'The dash did not keep the write',
    reassurance:
      'The dash is still running on whatever it stored — read it back before you trust the editor.',
  },
}

const REASONS: Record<string, string> = {
  E_CRC: 'Checksum mismatch',
  ACK_TIMEOUT: 'The dash stopped acknowledging',
  CHUNK_REJECTED: 'The dash rejected a chunk',
  DEVICE_ERROR: 'The dash reported an error',
  QUEUE_FULL: 'The dash was busy with another command',
  SEND_FAILED: 'The write never reached the dash',
  CONNECTION_CLOSED: 'The connection closed mid-write',
  DISCONNECTED: 'The dash disconnected mid-write',
  NOT_CONNECTED: 'No dash was connected',
  EMPTY_CONFIG: 'The config serialised to nothing',
  INVALID_CONFIG: 'The editor rejected the config before sending it',
  EXCEPTION: 'The write threw before the dash answered',
  UNKNOWN_ERROR: 'The dash reported an error',
  UNREACHABLE: 'The dash stopped answering after the write',
  FETCH_FAILED: 'The config could not be read back',
  MISMATCH: 'The config read back does not match the editor',
}

const reasonSentence = (
  code: string,
  rawCode: string,
  chunk: BurnChunkPosition | undefined
): string => {
  const reason = REASONS[code]
  if (reason === undefined) return humanizeTransportError(rawCode)
  if (chunk === undefined) return `${reason}.`
  return `${reason} on chunk ${String(chunk.index)} of ${String(chunk.total)}.`
}

export const describeBurnFailure = ({
  stage,
  command,
  code,
  chunk,
}: BurnFailureInput): BurnFailure => {
  const normalized = code.toUpperCase()
  const copy = STAGE_COPY[stage]
  return {
    command,
    code: normalized,
    title: copy.title,
    body: `${reasonSentence(normalized, code, chunk)} ${copy.reassurance}`,
  }
}
