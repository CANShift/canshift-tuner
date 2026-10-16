import { useDeviceStore } from '../stores/device.store'

export const activeDayMode = (deviceDayMode: boolean | null): boolean => deviceDayMode ?? false

export const useActiveDayMode = (): boolean => activeDayMode(useDeviceStore((s) => s.isDayMode))
