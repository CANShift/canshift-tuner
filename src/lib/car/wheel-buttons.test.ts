import { describe, expect, it } from 'vitest'
import { SignalDefSchema } from '@canshift/core'
import {
  isPressed,
  isWheelButton,
  wheelButtonMapping,
  wheelButtonNumber,
  wheelButtonSignal,
} from './wheel-buttons'

describe('wheelButtonSignal', () => {
  it('maps a single bit onto a valid 0/1 signal', () => {
    const signal = wheelButtonSignal('wheel_button_2', { frameId: 0x1a0, byte: 3, bit: 5 })
    expect(SignalDefSchema.safeParse(signal).success).toBe(true)
    expect(signal).toMatchObject({
      name: 'wheel_button_2',
      canFrameId: '0x1A0',
      startByte: 3,
      byteLength: 1,
      bitMask: '0x20',
      max: 1,
    })
  })

  it('maps a whole byte without a bit mask', () => {
    const signal = wheelButtonSignal('wheel_button_1', { frameId: 0x18fef100, byte: 0, bit: null })
    expect(SignalDefSchema.safeParse(signal).success).toBe(true)
    expect(signal).not.toHaveProperty('bitMask')
    expect(signal.canFrameId).toBe('0x18FEF100')
  })
})

describe('wheelButtonMapping', () => {
  it('reads back what was written', () => {
    const mapping = { frameId: 0x2f0, byte: 7, bit: 0 }
    expect(wheelButtonMapping(wheelButtonSignal('wheel_button_3', mapping))).toEqual(mapping)
    const whole = { frameId: 0x2f0, byte: 1, bit: null }
    expect(wheelButtonMapping(wheelButtonSignal('wheel_button_3', whole))).toEqual(whole)
  })

  it('treats a multi-bit mask as the whole byte', () => {
    const signal = { ...wheelButtonSignal('wheel_button_1', { frameId: 1, byte: 0, bit: 0 }) }
    expect(wheelButtonMapping({ ...signal, bitMask: '0x03' })?.bit).toBeNull()
  })

  it('refuses a signal without a broadcast frame', () => {
    const signal = wheelButtonSignal('wheel_button_1', { frameId: 1, byte: 0, bit: null })
    expect(wheelButtonMapping({ ...signal, canFrameId: 'obd' })).toBeNull()
  })
})

describe('slot helpers', () => {
  it('numbers the slots from one and recognises them', () => {
    expect(wheelButtonNumber('wheel_button_1')).toBe(1)
    expect(wheelButtonNumber('wheel_button_4')).toBe(4)
    expect(isWheelButton('wheel_button_3')).toBe(true)
    expect(isWheelButton('flag_cruise')).toBe(false)
  })

  it('reads any non-zero live value as pressed', () => {
    expect(isPressed(undefined)).toBe(false)
    expect(isPressed(0)).toBe(false)
    expect(isPressed(1)).toBe(true)
    expect(isPressed(32)).toBe(true)
  })
})
