import type { DashboardConfig, DeviceConfig } from '@canshift/core'
import { deviceConfigIpc, usbService } from '../../transport'
import { verifyBurnedConfig } from '../verify-burned-config'
import type { DashWriter, WriteResult } from './send-setup'

const OK: WriteResult = { ok: true }

const fromSuccess = (result: { success: boolean; error?: string | undefined }): WriteResult =>
  result.success ? OK : { ok: false, code: result.error ?? 'unknown_error' }

const writeDashboard = async (config: DashboardConfig): Promise<WriteResult> => {
  const pushed = await usbService.pushConfig(config)
  if (pushed.kind === 'error') return { ok: false, code: pushed.code }
  const verify = await verifyBurnedConfig(config)
  return verify.kind === 'mismatch' ? { ok: false, code: 'mismatch' } : OK
}

export const dashWriter: DashWriter = {
  writeDashboard,
  writeBrightness: async (brightness: number) =>
    fromSuccess(await usbService.pushScreenSettings({ brightness })),
  writeDeviceConfig: async (config: DeviceConfig) =>
    fromSuccess(await deviceConfigIpc.write(config)),
}
