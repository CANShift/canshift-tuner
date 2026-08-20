import { transportErrorText } from '../../transport/humanize-transport-error'

const OTA_ERROR_MESSAGES: Record<string, string> = {
  bad_args: 'The dash rejected the update request as malformed — reload the tuner and try again.',
  no_ota_partition:
    'This board has no spare update partition, so it cannot update itself over USB — flash it with the BOOT-button flasher instead.',
  size_out_of_range:
    'The image does not fit this board’s update partition — check you picked the build for this model.',
  ota_begin_failed:
    'The dash could not open its update partition — restart the dash and try again.',
  begin_failed: 'The dash refused to start the update — restart it and try again.',
  sha_engine_failed:
    'The dash’s checksum engine failed part-way through — restart the dash and try again.',
  b64_decode: 'A chunk of the update arrived corrupted — check the cable and try again.',
  not_receiving:
    'The dash is not expecting update data — restart the dash and start the flash again.',
  empty_chunk: 'The dash received an empty chunk — check the cable and try again.',
  offset_mismatch: 'A chunk of the update arrived out of order — check the cable and try again.',
  overrun: 'The tuner sent more data than it declared — reload the tuner and try again.',
  ota_write_failed: 'The dash could not write the update to flash — restart it and try again.',
  write_failed: 'The dash could not store a chunk of the update — check the cable and try again.',
  incomplete: 'The update was finished before all of it arrived — start the flash again.',
  sha256_mismatch:
    'The image arrived corrupted — its checksum does not match what the tuner sent. Check the cable and flash again.',
  ota_end_failed: 'The dash checked the finished image and refused it.',
  set_boot_failed: 'The dash could not switch its boot slot to the new firmware.',
  commit_failed: 'The dash could not finish the update.',
}

const ESP_OTA_DETAIL: Record<string, string> = {
  '0x1501': 'its partition table has conflicting update slots',
  '0x1502': 'its stored update-slot data is corrupt',
  '0x1503':
    'the image is not a valid ESP32 app, which usually means a merged or bootloader .bin was sent instead of the app-only firmware.bin',
  '0x1504': 'the image has a lower security version than the board accepts',
  '0x1505': 'a previous rollback did not complete',
  '0x1506': 'the board is not in a state that allows this',
}

const withReason = (base: string, reason: string): string =>
  `${base.replace(/\.$/, '')} — ${reason}.`

const detailReason = (detail: string): string =>
  ESP_OTA_DETAIL[detail.toLowerCase()] ?? `the board reported esp_err ${detail}`

export const otaErrorText = (code: string | undefined, detail?: string): string => {
  const base = OTA_ERROR_MESSAGES[code ?? ''] ?? transportErrorText(code)
  if (detail === undefined || detail.length === 0) return base
  return withReason(base, detailReason(detail))
}
