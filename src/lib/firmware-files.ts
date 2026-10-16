export const SIGNATURE_BYTES = 64

export type FirmwareFilesRejection = 'no-image' | 'no-signature' | 'extra-files' | 'bad-signature'

export const FIRMWARE_FILES_REJECTIONS: Record<FirmwareFilesRejection, string> = {
  'no-image': 'Choose the firmware .bin together with its .sig.',
  'no-signature':
    'Choose the release’s .sig together with the .bin. The dash refuses an unsigned image.',
  'extra-files': 'Choose one .bin and its .sig, nothing else.',
  'bad-signature': 'This .sig is not a firmware signature: a release signature is 64 bytes.',
}
