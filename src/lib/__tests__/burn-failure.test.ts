import { describe, expect, it } from 'vitest'
import { describeBurnFailure } from '../burn-failure'

describe('describeBurnFailure', () => {
  it('builds the planche kicker and copy for a rejected chunk', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'e_crc',
      chunk: { index: 7, total: 12 },
    })
    expect(`${failure.command} · ${failure.code}`).toBe('PUT_CONFIG · E_CRC')
    expect(failure.title).toBe('The dash rejected the write')
    expect(failure.body).toBe(
      'Checksum mismatch on chunk 7 of 12. The dash kept its previous config and is still running.'
    )
  })

  it('drops the chunk clause when the failure has no chunk position', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'invalid_config',
    })
    expect(failure.body).toBe(
      'The editor rejected the config before sending it. The dash kept its previous config and is still running.'
    )
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

  it('humanises an unknown code instead of leaking the wire string', () => {
    const failure = describeBurnFailure({
      stage: 'push',
      command: 'PUT_CONFIG',
      code: 'read_error',
    })
    expect(failure.body).toBe(
      'Lost the data stream while reading — check the cable and reconnect. The dash kept its previous config and is still running.'
    )
  })
})
