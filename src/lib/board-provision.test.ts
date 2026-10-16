import { describe, expect, it } from 'vitest'
import { BOARD_PROFILES, serializeBoardProfile, type BoardProfileBlob } from '@canshift/core'
import { boardProvisionPayload, interpretBoardProfileAck } from './board-provision'

const sampleBlob = (): BoardProfileBlob => {
  const profile = BOARD_PROFILES[0]
  if (!profile) throw new Error('catalog is empty')
  return JSON.parse(serializeBoardProfile(profile)) as BoardProfileBlob
}

describe('interpretBoardProfileAck', () => {
  it('maps an ok+restart reply to a reboot result', () => {
    expect(interpretBoardProfileAck({ ok: true, data: { status: 'ok', restart: true } })).toEqual({
      kind: 'ok',
      restart: true,
    })
  })

  it('maps an ok reply without restart to a non-reboot result', () => {
    expect(interpretBoardProfileAck({ ok: true, data: { status: 'ok' } })).toEqual({
      kind: 'ok',
      restart: false,
    })
  })

  it('maps invalid_board_profile to the invalid result, from either the ack or the payload', () => {
    expect(interpretBoardProfileAck({ ok: false, error: 'invalid_board_profile' })).toEqual({
      kind: 'invalid',
    })
    expect(
      interpretBoardProfileAck({ ok: true, data: { error: 'invalid_board_profile' } })
    ).toEqual({ kind: 'invalid' })
  })

  it('maps a transport failure to an error result', () => {
    expect(interpretBoardProfileAck({ ok: false, error: 'timeout' })).toEqual({
      kind: 'error',
      error: 'timeout',
    })
  })
})

describe('boardProvisionPayload', () => {
  it('sends a catalogue board by id, in the wire format', () => {
    expect(boardProvisionPayload({ kind: 'catalog', boardId: 'waveshare_s3_28' })).toEqual({
      board_id: 'waveshare_s3_28',
    })
  })

  it('sends a custom board as the blob it has always sent', () => {
    const blob = sampleBlob()
    expect(boardProvisionPayload({ kind: 'custom', blob })).toBe(blob)
  })
})

describe('interpretBoardProfileAck, unknown board', () => {
  it('tells an unknown id apart from an invalid profile', () => {
    expect(interpretBoardProfileAck({ ok: false, error: 'unknown_board_id' })).toEqual({
      kind: 'unknown-board',
    })
    expect(interpretBoardProfileAck({ ok: false, error: 'invalid_board_profile' })).toEqual({
      kind: 'invalid',
    })
  })

  it('reads the code out of the ack payload as well as the envelope', () => {
    expect(interpretBoardProfileAck({ ok: true, data: { error: 'unknown_board_id' } })).toEqual({
      kind: 'unknown-board',
    })
  })
})
