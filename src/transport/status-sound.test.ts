import { describe, expect, it } from 'vitest'
import { statusSound } from './status-sound'

const STATUS = { status: 'ok', version: '0.22.0', protocol: 3, is_day: 0, board_id: 'x' }

describe('statusSound', () => {
  it('maps the sound a board with a speaker reports', () => {
    const status = { ...STATUS, volume: 40, sounds: { boot: false, shift_tone: true } }
    expect(statusSound(status)).toEqual({ sound: { volume: 40, boot: false, shiftTone: true } })
  })

  it('reports nothing for a board without audio or a malformed sound', () => {
    expect(statusSound(STATUS)).toEqual({})
    expect(
      statusSound({ ...STATUS, volume: 400, sounds: { boot: true, shift_tone: false } })
    ).toEqual({})
  })
})
