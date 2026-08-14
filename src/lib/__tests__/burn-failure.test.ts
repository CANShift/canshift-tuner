import { describe, expect, it } from 'vitest'
import { describeBurnFailure } from '../burn-failure'

const REASSURANCE = 'The dash kept its previous config and is still running.'

describe('describeBurnFailure', () => {
  it('builds the planche kicker and copy for a rejected chunk', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'e_crc',
      chunk: { index: 7, total: 12 },
    })
    expect(failure.kicker).toBe('PUT_CONFIG · E_CRC')
    expect(failure.title).toBe('The dash rejected the write')
    expect(failure.body).toBe(`Checksum mismatch on chunk 7 of 12. ${REASSURANCE}`)
  })

  it('drops the chunk clause when the failure has no chunk position', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'chunk_rejected',
    })
    expect(failure.body).toBe(`The dash rejected a chunk. ${REASSURANCE}`)
  })

  it('does not promise an untouched dash when the verify step failed', () => {
    const failure = describeBurnFailure({
      stage: 'verify',
      command: 'GET_CONFIG',
      code: 'mismatch',
    })
    expect(failure.code).toBe('MISMATCH')
    expect(failure.body).not.toContain('kept its previous config')
    expect(failure.body).toContain('The config read back does not match the editor.')
  })

  it('names no command and promises no dash state when nothing was sent', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'not_connected',
    })
    expect(failure.kicker).toBe('TUNER · NOT_CONNECTED')
    expect(failure.title).toBe('The burn never left the tuner')
    expect(failure.body).toBe('No dash was connected. Nothing was written to any dash.')
  })

  it.each(['invalid_config', 'empty_config', 'send_failed'])(
    'keeps %s off the wire and off the dash',
    (code) => {
      const failure = describeBurnFailure({ stage: 'push', command: 'PUT_CONFIG', code })
      expect(failure.kicker.startsWith('TUNER · ')).toBe(true)
      expect(failure.body).not.toContain('kept its previous config')
      expect(failure.body).toContain('Nothing was written to any dash.')
    }
  )

  it('does not claim the dash kept anything when it never answered', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'disconnected',
      chunk: { index: 3, total: 9 },
    })
    expect(failure.kicker).toBe('PUT_CONFIG · DISCONNECTED')
    expect(failure.title).toBe('The dash never confirmed the write')
    expect(failure.body).toBe(
      'The dash disconnected mid-write on chunk 3 of 9. The write stopped part-way — read the dash back before you trust the editor.'
    )
  })

  it('humanises an unknown code instead of leaking the wire string', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'read_error',
    })
    expect(failure.body).toContain('Lost the data stream while reading — check the cable')
    expect(failure.body).not.toContain('read_error')
  })

  it('keeps the chunk position on a code outside the reason table', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'read_error',
      chunk: { index: 4, total: 21 },
    })
    expect(failure.body).toContain('It stopped on chunk 4 of 21.')
  })

  it('keeps the chunk position on a code with no humanised message at all', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'e_flash_write',
      chunk: { index: 2, total: 5 },
    })
    expect(failure.body).toContain('It stopped on chunk 2 of 5.')
  })
})
