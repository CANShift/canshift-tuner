import { transportErrorText } from '../transport/humanize-transport-error'

const OTA_ERROR_MESSAGES: Record<string, string> = {
  bad_args: 'The dash rejected the update request as malformed. Reload the tuner and try again.',
  no_ota_partition: 'This board has no spare update slot, so it cannot update itself.',
  size_out_of_range: 'The image does not fit this board. Check it is the build for this model.',
  ota_unsigned:
    'The dash refused an unsigned image. Choose the release’s .sig together with the .bin.',
  ota_bad_signature:
    'The dash refused the image: its signature does not match. Use the .bin and .sig from the same official release.',
  ota_begin_failed: 'The dash could not open its update slot. Restart the dash and try again.',
  begin_failed: 'The dash refused to start the update. Restart it and try again.',
  sha_engine_failed: 'The dash’s checksum engine failed. Restart the dash and try again.',
  b64_decode: 'A chunk of the update arrived corrupted. Check the link and try again.',
  not_receiving: 'The dash is not expecting update data. Start the update again.',
  empty_chunk: 'The dash received an empty chunk. Check the link and try again.',
  offset_mismatch: 'A chunk of the update arrived out of order. Check the link and try again.',
  overrun: 'The tuner sent more data than it declared. Reload the tuner and try again.',
  not_app_image: 'The dash refused this file: it is not an app-only firmware image.',
  ota_write_failed: 'The dash could not write the update to flash. Restart it and try again.',
  write_failed: 'The dash could not store a chunk of the update. Try again.',
  incomplete: 'The update ended before all of it arrived. Start it again.',
  sha256_mismatch: 'The image arrived corrupted: its checksum does not match the file. Try again.',
  ota_end_failed: 'The dash checked the finished image and refused it.',
  set_boot_failed: 'The dash could not switch to the new firmware.',
  commit_failed: 'The dash could not finish the update.',
}

const ESP_OTA_DETAIL: Record<string, string> = {
  '0x1503': 'the image is not a valid ESP32 app for this board',
  '0x1504': 'the image has a lower security version than the board accepts',
  '0x1505': 'a previous rollback did not complete',
}

const NO_DETAIL = new Set(['', '0x0'])

const detailReason = (detail: string): string =>
  ESP_OTA_DETAIL[detail.toLowerCase()] ?? `the board reported error ${detail}`

export const otaErrorText = (code: string | undefined, detail?: string): string => {
  const base = OTA_ERROR_MESSAGES[code ?? ''] ?? transportErrorText(code)
  if (detail === undefined || NO_DETAIL.has(detail.toLowerCase())) return base
  return `${base.replace(/\.$/, '')}: ${detailReason(detail)}.`
}
