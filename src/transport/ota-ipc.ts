import { CMD_OTA_BEGIN, CMD_OTA_END, CMD_OTA_WRITE } from './opcodes'
import { getDeviceLink } from './link'
import type { AckResult } from './ack-queue'

const ACK_TIMEOUT_MS = 8_000
const COMMIT_TIMEOUT_MS = 15_000

export const otaIpc = {
  begin: (total: number, sha256: string, sig: string, version: string): Promise<AckResult> =>
    getDeviceLink().send(
      CMD_OTA_BEGIN,
      { total, sha256, sig, version },
      { timeoutMs: ACK_TIMEOUT_MS }
    ),

  write: (offset: number, data: string): Promise<AckResult> =>
    getDeviceLink().send(CMD_OTA_WRITE, { offset, data }, { timeoutMs: ACK_TIMEOUT_MS }),

  commit: (): Promise<AckResult> =>
    getDeviceLink().send(CMD_OTA_END, { action: 'commit' }, { timeoutMs: COMMIT_TIMEOUT_MS }),

  abort: (): Promise<AckResult> =>
    getDeviceLink().send(CMD_OTA_END, { action: 'abort' }, { timeoutMs: ACK_TIMEOUT_MS }),
}
