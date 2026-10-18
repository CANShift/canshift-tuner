import type { BoardProfileBlob } from '@canshift/core'

const INVALID_BOARD_PROFILE = 'invalid_board_profile'
const UNKNOWN_BOARD_ID = 'unknown_board_id'

export type BoardProfileWriteResult =
  | { kind: 'ok'; restart: boolean }
  | { kind: 'invalid' }
  | { kind: 'unknown-board' }
  | { kind: 'error'; error: string }

export type BoardProvision =
  { kind: 'catalog'; boardId: string } | { kind: 'custom'; blob: BoardProfileBlob }

export interface BoardProvisionWire {
  board_id?: string
}

export const boardProvisionPayload = (
  provision: BoardProvision
): BoardProvisionWire | BoardProfileBlob =>
  provision.kind === 'catalog' ? { board_id: provision.boardId } : provision.blob

interface BoardProfileAck {
  ok: boolean
  error?: string
  data?: Record<string, unknown>
}

const failureFor = (error: string): BoardProfileWriteResult => {
  if (error.includes(UNKNOWN_BOARD_ID)) return { kind: 'unknown-board' }
  if (error.includes(INVALID_BOARD_PROFILE)) return { kind: 'invalid' }
  return { kind: 'error', error }
}

export const interpretBoardProfileAck = (result: BoardProfileAck): BoardProfileWriteResult => {
  if (!result.ok) return failureFor(result.error ?? 'unknown_error')
  const data = result.data ?? {}
  if (typeof data.error === 'string') return failureFor(data.error)
  if (data.status !== undefined && data.status !== 'ok') {
    return { kind: 'error', error: `unexpected status: ${String(data.status)}` }
  }
  return { kind: 'ok', restart: data.restart === true }
}
