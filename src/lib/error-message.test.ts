import { describe, expect, it } from 'vitest'
import { errorMessage } from './error-message'

describe('errorMessage', () => {
  it('takes the message off an Error', () => {
    expect(errorMessage(new Error('port busy'))).toBe('port busy')
  })

  it('passes a thrown string through', () => {
    expect(errorMessage('ack_timeout')).toBe('ack_timeout')
  })

  it('falls back rather than stringifying an object into [object Object]', () => {
    expect(errorMessage({ code: 7 })).toBe('unknown_error')
    expect(errorMessage(null)).toBe('unknown_error')
    expect(errorMessage(undefined)).toBe('unknown_error')
  })

  it('falls back on an Error with an empty message', () => {
    expect(errorMessage(new Error(''), 'open_failed')).toBe('open_failed')
  })

  it('uses the caller fallback when one is given', () => {
    expect(errorMessage(42, 'connect_failed')).toBe('connect_failed')
  })
})
