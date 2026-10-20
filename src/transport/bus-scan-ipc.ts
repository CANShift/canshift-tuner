import { CMD_BUS_SCAN_POLL, CMD_BUS_SCAN_START } from './opcodes'
import { parseBusScanReport, type BusScanReport } from './bus-scan-wire'
import { toUsbResult, type UsbResult } from './types'
import { getDeviceLink } from './link'

export type BusScanPoll = { kind: 'ok'; report: BusScanReport } | { kind: 'error'; error: string }

export const busScanIpc = {
  start: async (): Promise<UsbResult> =>
    toUsbResult(await getDeviceLink().send(CMD_BUS_SCAN_START)),

  poll: async (): Promise<BusScanPoll> => {
    const result = await getDeviceLink().send(CMD_BUS_SCAN_POLL)
    if (!result.ok) return { kind: 'error', error: result.error ?? 'unknown_error' }
    const report = parseBusScanReport(result.data)
    if (report === null) return { kind: 'error', error: 'invalid_bus_scan_reply' }
    return { kind: 'ok', report }
  },
}
