import { describe, expect, it } from 'vitest'
import { STRINGS } from '../../strings'
import { firmwareFailure } from './failure'
import { pickedSig } from './picked-files'

describe('firmwareFailure', () => {
  it('says the signature does not match and that the old version still runs', () => {
    const failure = firmwareFailure('ota_bad_signature', undefined, 'raw', '2.4.1')
    expect(failure.cause).toBe(STRINGS.firmware.signatureMismatch('2.4.1'))
    expect(failure.advice).toBe(STRINGS.firmware.signatureAdvice)
  })

  it('reads a dropped link as nothing installed', () => {
    expect(firmwareFailure('connection_closed', undefined, 'raw', '2.4.1').cause).toBe(
      STRINGS.firmware.wifiDropped
    )
  })

  it('recognises a file for another board', () => {
    expect(firmwareFailure('ota_end_failed', '0x1503', 'raw', '2.4.1').cause).toBe(
      STRINGS.firmware.otherDashGeneric
    )
  })

  it('keeps the plain message for anything else and still names the running version', () => {
    const failure = firmwareFailure(
      'commit_failed',
      undefined,
      'The dash could not finish the update.',
      '2.4.1'
    )
    expect(failure).toEqual({
      cause: 'The dash could not finish the update.',
      advice: STRINGS.firmware.stillRuns('2.4.1'),
    })
  })
})

describe('pickedSig', () => {
  it('accepts only a 64-byte release signature', () => {
    expect(pickedSig('a.sig', new Uint8Array(64)).kind).toBe('ok')
    expect(pickedSig('a.sig', new Uint8Array(10)).kind).toBe('rejected')
  })
})
