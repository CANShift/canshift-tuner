import { describe, it, expect } from 'vitest'
import {
  humanizeTransportError,
  transportErrorText,
  TRANSPORT_ERROR_MESSAGES,
} from '../humanize-transport-error'

const KNOWN_CODES = [
  'no_port_selected',
  'webserial_unavailable',
  'streams_unavailable',
  'connection_closed',
  'auto_reconnect_failed',
  'connect_failed',
  'open_failed',
  'ack_timeout',
  'not_connected',
  'disconnected',
  'queue_full',
  'read_error',
  'send_failed',
  'device_error',
  'unknown_error',
  'read_failed',
  'clear_failed',
  'fetch_failed',
  'invalid_board_profile',
]

describe('humanizeTransportError', () => {
  it('has a message for every known transport code', () => {
    expect(Object.keys(TRANSPORT_ERROR_MESSAGES).sort()).toEqual([...KNOWN_CODES].sort())
  })

  it.each(KNOWN_CODES)('maps %s to a human-readable message', (code) => {
    const message = humanizeTransportError(code)
    expect(message).toBe(TRANSPORT_ERROR_MESSAGES[code])
    expect(message).not.toBe(code)
    expect(message).not.toMatch(/_/)
  })

  it.each([
    ['Failed to open serial port.', /^Port busy/],
    ['The port is already open.', /^Port busy/],
    ['NotFoundError: the device has been lost', /^Device not found/],
    ['Access denied.', /^Permission denied/],
    ['insufficient permission to open port', /^Permission denied/],
  ])('humanizes raw browser open errors: %s', (raw, expected) => {
    expect(humanizeTransportError(raw)).toMatch(expected)
  })

  it('passes unknown strings through unchanged', () => {
    expect(humanizeTransportError('something exotic happened')).toBe('something exotic happened')
  })
})

describe('transportErrorText', () => {
  it('treats a missing, null or empty code as unknown_error rather than rendering blank', () => {
    const unknown = TRANSPORT_ERROR_MESSAGES.unknown_error
    expect(transportErrorText(undefined)).toBe(unknown)
    expect(transportErrorText(null)).toBe(unknown)
    expect(transportErrorText('')).toBe(unknown)
  })

  it.each(KNOWN_CODES)('never renders %s raw to a user', (code) => {
    expect(transportErrorText(code)).not.toBe(code)
  })
})
