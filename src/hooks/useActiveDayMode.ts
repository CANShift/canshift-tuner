import { useDashboardStore } from '../stores/dashboard.store'
import { useDeviceStore } from '../stores/device.store'

export const activeDayMode = (deviceDayMode: boolean | null, previewDayMode: boolean): boolean =>
  deviceDayMode ?? previewDayMode

export const useActiveDayMode = (): boolean => {
  const deviceDayMode = useDeviceStore((s) => s.isDayMode)
  const previewDayMode = useDashboardStore((s) => s.isPreviewDayMode)
  return activeDayMode(deviceDayMode, previewDayMode)
}
