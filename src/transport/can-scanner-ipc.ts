import { CMD_CAN_SCAN_START, CMD_CAN_SCAN_STOP } from './opcodes'
import { toUsbResult } from './types'
import { getDeviceLink } from './link'

export const canScannerIpc = {
  start: async (): Promise<{ success: boolean; error?: string }> => {
    return toUsbResult(await getDeviceLink().send(CMD_CAN_SCAN_START))
  },
  stop: async (): Promise<{ success: boolean; error?: string }> => {
    return toUsbResult(await getDeviceLink().send(CMD_CAN_SCAN_STOP))
  },
}
