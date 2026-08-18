import { SIGNAL_BYTE_LENGTHS } from '@canshift/core'
import type { SignalByteLength } from '@canshift/core'

const MAX_START_BYTE = 7
const RANGE = /^\s*(\d+)\s*(?:[-–]\s*(\d+)\s*)?$/

export interface ByteRange {
  startByte: number
  byteLength: SignalByteLength
}

export const formatByteRange = (startByte: number, byteLength: number): string =>
  byteLength <= 1 ? String(startByte) : `${String(startByte)}–${String(startByte + byteLength - 1)}`

export const parseByteRange = (raw: string): ByteRange | null => {
  const match = RANGE.exec(raw)
  if (!match) return null
  const start = Number(match[1])
  const end = match[2] === undefined ? start : Number(match[2])
  if (end < start || start > MAX_START_BYTE || end > MAX_START_BYTE) return null
  const length = end - start + 1
  if (!SIGNAL_BYTE_LENGTHS.includes(length as SignalByteLength)) return null
  return { startByte: start, byteLength: length as SignalByteLength }
}
