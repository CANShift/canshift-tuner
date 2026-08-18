export const isWebSerialAvailable = (): boolean =>
  typeof navigator !== 'undefined' && 'serial' in navigator
