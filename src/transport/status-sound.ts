import type { SoundSettings } from '@canshift/core/wire'
import { parseUsbStatus } from '@canshift/core/wire'

export const statusSound = (status: Record<string, unknown>): { sound?: SoundSettings } => {
  const parsed = parseUsbStatus(JSON.stringify(status))
  if (parsed.kind !== 'ok' || parsed.status.sound === undefined) return {}
  return { sound: parsed.status.sound }
}
