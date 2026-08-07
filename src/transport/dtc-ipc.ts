import { decodeDtcList } from '@canshift/core'
import { CMD_OBD_CLEAR_DTC, CMD_OBD_READ_DTC } from './opcodes'
import { getSerialClient } from './webserial-client'

const DTC_READ_TIMEOUT_MS = 5_000
const DTC_CLEAR_TIMEOUT_MS = 3_000

export interface DtcReadResult {
  ok: boolean
  codes: string[]
  error?: string
}

export interface DtcClearResult {
  ok: boolean
  error?: string
}

export const parseDtcBytes = (value: unknown): number[] | null => {
  if (!Array.isArray(value)) return null
  const bytes: number[] = []
  for (const entry of value) {
    if (typeof entry !== 'number' || !Number.isInteger(entry) || entry < 0 || entry > 0xff) {
      return null
    }
    bytes.push(entry)
  }
  return bytes
}

export const dtcIpc = {
  read: async (): Promise<DtcReadResult> => {
    const result = await getSerialClient().send(
      CMD_OBD_READ_DTC,
      {},
      { timeoutMs: DTC_READ_TIMEOUT_MS }
    )
    if (!result.ok) return { ok: false, codes: [], error: result.error ?? 'unknown_error' }
    const bytes = parseDtcBytes(result.data?.dtc_bytes)
    if (bytes === null) return { ok: false, codes: [], error: 'invalid_dtc_response' }
    return { ok: true, codes: decodeDtcList(bytes) }
  },

  clear: async (): Promise<DtcClearResult> => {
    const result = await getSerialClient().send(
      CMD_OBD_CLEAR_DTC,
      {},
      { timeoutMs: DTC_CLEAR_TIMEOUT_MS }
    )
    if (result.ok) return { ok: true }
    return { ok: false, error: result.error ?? 'unknown_error' }
  },
}
