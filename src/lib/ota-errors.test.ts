import { describe, expect, it } from 'vitest'
import { otaErrorText } from './ota-errors'

const FIRMWARE_CODES = [
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
  'not_app_image',
  'ota_write_failed',
  'write_failed',
  'incomplete',
  'sha256_mismatch',
  'ota_end_failed',
  'set_boot_failed',
  'commit_failed',
]

describe('otaErrorText', () => {
  it('never shows a raw firmware code', () => {
    for (const code of FIRMWARE_CODES) expect(otaErrorText(code)).not.toContain(code)
  })

  it('humanises transport codes through the shared map', () => {
    expect(otaErrorText('ack_timeout')).not.toContain('ack_timeout')
  })

  it('explains a known esp_err detail and keeps an unknown one for bug reports', () => {
    expect(otaErrorText('ota_end_failed', '0x1503')).toMatch(/not a valid ESP32 app/)
    expect(otaErrorText('ota_end_failed', '0x9999')).toContain('0x9999')
  })

  it('ignores an empty detail', () => {
    expect(otaErrorText('commit_failed', '0x0')).toBe('The dash could not finish the update.')
  })
})
