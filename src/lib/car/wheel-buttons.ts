import { WHEEL_BUTTON_SIGNALS, type SignalDef, type WheelButtonSignal } from '@canshift/core'
import { STRINGS } from '../../strings'
import { formatFrameIdHex, parseHexFrameId } from '../../utils/frame-id'

export interface WheelButtonMapping {
  frameId: number
  byte: number
  bit: number | null
}

export const WHEEL_BUTTON_BYTES = [0, 1, 2, 3, 4, 5, 6, 7] as const
export const WHEEL_BUTTON_BITS = [0, 1, 2, 3, 4, 5, 6, 7] as const

const WHEEL_BUTTON_TIMEOUT_MS = 1_000
const WHOLE_BYTE_MAX = 255
const SINGLE_BIT_MAX = 1
const HEX_RADIX = 16

const bitMaskOf = (bit: number): string =>
  `0x${(1 << bit).toString(HEX_RADIX).toUpperCase().padStart(2, '0')}`

const bitOf = (mask: string | undefined): number | null => {
  if (mask === undefined) return null
  const value = Number.parseInt(mask, HEX_RADIX)
  const bit = WHEEL_BUTTON_BITS.find((candidate) => 1 << candidate === value)
  return bit ?? null
}

export const isWheelButton = (name: string): name is WheelButtonSignal =>
  (WHEEL_BUTTON_SIGNALS as readonly string[]).includes(name)

export const wheelButtonSignal = (name: string, mapping: WheelButtonMapping): SignalDef => ({
  name,
  canFrameId: formatFrameIdHex(mapping.frameId),
  startByte: mapping.byte,
  byteLength: 1,
  bigEndian: false,
  signed: false,
  ...(mapping.bit === null ? {} : { bitMask: bitMaskOf(mapping.bit) }),
  scale: 1,
  offset: 0,
  unit: '',
  min: 0,
  max: mapping.bit === null ? WHOLE_BYTE_MAX : SINGLE_BIT_MAX,
  timeoutMs: WHEEL_BUTTON_TIMEOUT_MS,
})

export const wheelButtonMapping = (signal: SignalDef): WheelButtonMapping | null => {
  const frameId = parseHexFrameId(signal.canFrameId)
  if (frameId < 0) return null
  return { frameId, byte: signal.startByte, bit: bitOf(signal.bitMask) }
}

const remappedSignal = (signal: SignalDef, mapping: WheelButtonMapping): SignalDef => {
  const { bitMask: _bitMask, ...rest } = signal
  const { canFrameId, startByte, byteLength, bitMask } = wheelButtonSignal(signal.name, mapping)
  return {
    ...rest,
    canFrameId,
    startByte,
    byteLength,
    ...(bitMask === undefined ? {} : { bitMask }),
  }
}

export const buttonSignal = (
  name: string,
  mapping: WheelButtonMapping,
  existing: SignalDef | undefined
): SignalDef =>
  existing === undefined || isWheelButton(name)
    ? wheelButtonSignal(name, mapping)
    : remappedSignal(existing, mapping)

export const isPressed = (value: number | undefined): boolean => value !== undefined && value !== 0

export const mappingText = (mapping: WheelButtonMapping | null): string =>
  mapping === null
    ? STRINGS.dash.notSet
    : STRINGS.car.mappingText(formatFrameIdHex(mapping.frameId), mapping.byte, mapping.bit)
