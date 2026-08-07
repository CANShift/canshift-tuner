const HEX_FRAME_ID = /^0[xX][0-9A-Fa-f]+$/
const EXTENDED_ID_THRESHOLD = 0x7ff

export const parseHexFrameId = (raw: string): number => {
  if (!HEX_FRAME_ID.test(raw.trim())) return -1
  const value = Number.parseInt(raw, 16)
  return Number.isNaN(value) ? -1 : value
}

export const formatFrameIdHex = (id: number): string => {
  const width = id > EXTENDED_ID_THRESHOLD ? 8 : 3
  return `0x${id.toString(16).toUpperCase().padStart(width, '0')}`
}
