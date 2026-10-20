import type { DashboardConfig, DeviceConfig } from '@canshift/core'
import type { SoundSettings } from '@canshift/core/wire'
import { deviceConfigIpc, usbService } from '../../transport'
import { verifyBurnedConfig, type VerifyResult } from '../verify-burned-config'
import { SIGNALS_FILE_PATH, putFile } from '../../transport/file-ipc'
import type { DashWriter, WriteResult } from './send-setup'
import type { ScreenRotation } from './setup'

const OK: WriteResult = { ok: true }

const fromSuccess = (result: { success: boolean; error?: string | undefined }): WriteResult =>
  result.success ? OK : { ok: false, code: result.error ?? 'unknown_error' }

const VERIFY_OUTCOMES: Record<VerifyResult['kind'], WriteResult> = {
  ok: OK,
  unreachable: OK,
  fetch_failed: OK,
  mismatch: { ok: false, code: 'mismatch' },
  refused: { ok: false, code: 'config_refused' },
}

const writeDashboard = async (config: DashboardConfig): Promise<WriteResult> => {
  const pushed = await usbService.pushConfig(config)
  if (pushed.kind === 'error') return { ok: false, code: pushed.code }
  const verify = await verifyBurnedConfig(config)
  return VERIFY_OUTCOMES[verify.kind]
}

export const dashWriter: DashWriter = {
  writeDashboard,
  writeBrightness: async (brightness: number) =>
    fromSuccess(await usbService.pushScreenSettings({ brightness })),
  writeDeviceConfig: async (config: DeviceConfig) =>
    fromSuccess(await deviceConfigIpc.write(config)),
  writeDayMode: async (day: boolean) => fromSuccess(await usbService.setDayNight(day)),
  writeRotation: async (rotation: ScreenRotation, brightness: number) =>
    fromSuccess(await usbService.pushScreenSettings({ brightness, rotation })),
  writeSound: async ({ volume, boot, shiftTone }: SoundSettings, brightness: number) =>
    fromSuccess(
      await usbService.pushScreenSettings({ brightness, volume, sounds: { boot, shiftTone } })
    ),
  writeSignals: async (file: string) => {
    const result = await putFile(SIGNALS_FILE_PATH, file)
    return result.kind === 'ok' ? OK : { ok: false, code: result.code }
  },
}
