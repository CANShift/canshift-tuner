import { serializeBoardProfile, type BoardProfile, type BoardProfileBlob } from '@canshift/core'

export const INVALID_BOARD_PROFILE = 'invalid_board_profile'

export type BoardProfileWriteResult =
  { kind: 'ok'; restart: boolean } | { kind: 'invalid' } | { kind: 'error'; error: string }

export const boardProfileBlob = (profile: BoardProfile): BoardProfileBlob =>
  JSON.parse(serializeBoardProfile(profile)) as BoardProfileBlob

interface BoardProfileAck {
  ok: boolean
  error?: string
  data?: Record<string, unknown>
}

export const interpretBoardProfileAck = (result: BoardProfileAck): BoardProfileWriteResult => {
  if (!result.ok) {
    const error = result.error ?? 'unknown_error'
    return error.includes(INVALID_BOARD_PROFILE) ? { kind: 'invalid' } : { kind: 'error', error }
  }
  const data = result.data ?? {}
  if (typeof data.error === 'string') {
    return data.error.includes(INVALID_BOARD_PROFILE)
      ? { kind: 'invalid' }
      : { kind: 'error', error: data.error }
  }
  if (data.status !== undefined && data.status !== 'ok') {
    return { kind: 'error', error: `unexpected status: ${String(data.status)}` }
  }
  return { kind: 'ok', restart: data.restart === true }
}
