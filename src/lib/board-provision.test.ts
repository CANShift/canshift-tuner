import { describe, expect, it } from 'vitest'
import { BOARD_PROFILES, parseBoardProfile } from '@canshift/core'
import {
  boardProfileBlob,
  boardProvisionPayload,
  interpretBoardProfileAck,
} from './board-provision'

const sampleProfile = () => {
  const profile = BOARD_PROFILES[0]
  if (!profile) throw new Error('catalog is empty')
  return profile
}

describe('boardProfileBlob', () => {
  it('assembles the versioned board-profile envelope from a profile', () => {
    const blob = boardProfileBlob(sampleProfile())
    expect(blob.magic).toBe('CANSHIFT_BOARD')
    expect(blob.schema).toBe('board-profile')
    expect(blob.formatVersion).toBe(1)
    expect(blob.profile.board_id).toBe(sampleProfile().boardId)
  })

  it('produces a blob that core can parse back to the same board', () => {
    const blob = boardProfileBlob(sampleProfile())
    const parsed = parseBoardProfile(JSON.stringify(blob))
    expect(parsed.kind).toBe('ok')
    if (parsed.kind === 'ok') expect(parsed.profile.boardId).toBe(sampleProfile().boardId)
  })
})

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
    const blob = boardProfileBlob(sampleProfile())
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
