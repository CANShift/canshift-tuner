import { describe, it, expect } from 'vitest'

import { otaErrorText } from './ota-errors'

describe('otaErrorText', () => {
  it('explains the commit rejection that means a merged image was sent', () => {
    const text = otaErrorText('ota_end_failed', '0x1503')

    expect(text).toMatch(/refused it/)
    expect(text).toMatch(/not a valid ESP32 app/)
    expect(text).toMatch(/firmware\.bin/)
  })

  it('never leaks the raw slug for any code the firmware can send', () => {
    const slugs = [
      'bad_args',
      'no_ota_partition',
      'size_out_of_range',
      'ota_begin_failed',
      'begin_failed',
      'sha_engine_failed',
      'b64_decode',
      'not_receiving',
      'empty_chunk',
      'offset_mismatch',
      'overrun',
      'ota_write_failed',
      'write_failed',
      'incomplete',
      'sha256_mismatch',
      'ota_end_failed',
      'set_boot_failed',
      'commit_failed',
    ]

    for (const slug of slugs) {
      expect(otaErrorText(slug)).not.toContain(slug)
    }
  })

  it('humanises transport codes through the shared transport map', () => {
    expect(otaErrorText('ack_timeout')).not.toContain('ack_timeout')
    expect(otaErrorText('not_connected')).not.toContain('not_connected')
  })

  it('keeps an unrecognised esp_err visible for a bug report', () => {
    expect(otaErrorText('ota_end_failed', '0x9999')).toContain('0x9999')
  })

  it('joins reason to base without doubling the full stop', () => {
    expect(otaErrorText('set_boot_failed', '0x1502')).not.toMatch(/\.\s*—/)
    expect(otaErrorText('set_boot_failed', '0x1502')).toMatch(/\.$/)
  })

  it('falls back to a generic message when the dash sends no code', () => {
    expect(otaErrorText(undefined)).toMatch(/went wrong/)
  })
})
