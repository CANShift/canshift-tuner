export const SIGNATURE_BYTES = 64

export type FirmwareFilesRejection = 'no-image' | 'no-signature' | 'extra-files' | 'bad-signature'

export interface PairedFiles {
  kind: 'paired'
  image: File
  signature: File
}

export type FirmwareFiles = PairedFiles | { kind: 'rejected'; rejection: FirmwareFilesRejection }

export const FIRMWARE_FILES_REJECTIONS: Record<FirmwareFilesRejection, string> = {
  'no-image': 'Choose the firmware .bin together with its .sig.',
  'no-signature':
    'Choose the release’s .sig together with the .bin. The dash refuses an unsigned image.',
  'extra-files': 'Choose one .bin and its .sig, nothing else.',
  'bad-signature': 'This .sig is not a firmware signature: a release signature is 64 bytes.',
}

const hasExtension = (file: File, extension: string): boolean =>
  file.name.toLowerCase().endsWith(extension)

const rejected = (rejection: FirmwareFilesRejection): FirmwareFiles => ({
  kind: 'rejected',
  rejection,
})

export const pairFirmwareFiles = (files: readonly File[]): FirmwareFiles => {
  const images = files.filter((file) => hasExtension(file, '.bin'))
  const signatures = files.filter((file) => hasExtension(file, '.sig'))
  const [image] = images
  const [signature] = signatures
  if (image === undefined) return rejected('no-image')
  if (signature === undefined) return rejected('no-signature')
  if (files.length !== 2 || images.length !== 1) return rejected('extra-files')
  if (signature.size !== SIGNATURE_BYTES) return rejected('bad-signature')
  return { kind: 'paired', image, signature }
}
