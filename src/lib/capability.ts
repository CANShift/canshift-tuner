export type CapabilityReason = 'narrow' | 'no-web-serial'

export const capabilityReason = (
  belowFloor: boolean,
  webSerial: boolean
): CapabilityReason | null => {
  if (!webSerial) return 'no-web-serial'
  return belowFloor ? 'narrow' : null
}
