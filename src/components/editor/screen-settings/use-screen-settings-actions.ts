import { useState } from 'react'
import {
  useScreenSettingsStore,
  type StoredScreenSettings,
} from '../../../stores/screen-settings.store'
import { useLogStore } from '../../../stores/log.store'
import { DEFAULT_BRIGHTNESS } from '../../../hooks/useSettingsDraft'
import { useSyncStore } from '../../../stores/sync/sync.store'
import { useDeviceState } from '../../../hooks/useDeviceState'
import { usePreviewTheme } from '../../../hooks/useDashboardConfig'
import { usbService } from '../../../transport'
import { transportErrorText } from '../../../transport/humanize-transport-error'

export type Rotation = 0 | 180
type StoredRotation = StoredScreenSettings['rotation']
export type ThemeMode = 'night' | 'day'

const useCanDeviceAction = (): boolean => {
  const { connected, simulationMode } = useDeviceState()
  return connected && !simulationMode
}

const useScreenPush = () => {
  const brightness = useSyncStore((s) => s.device.settings.brightness) ?? DEFAULT_BRIGHTNESS
  const rotation = useScreenSettingsStore((s) => s.rotation)
  const canDeviceAction = useCanDeviceAction()
  const log = useLogStore((s) => s.push)
  return async (nextRotation: StoredRotation = rotation) => {
    if (!canDeviceAction) return
    const result = await usbService.pushScreenSettings({ brightness, rotation: nextRotation })
    if (result.success) {
      log('success', `Screen settings pushed — brightness ${String(brightness)}%`)
      return
    }
    log('error', `Screen settings push failed: ${transportErrorText(result.error)}`)
  }
}

export const useRotationChoice = () => {
  const rotation = useScreenSettingsStore((s) => s.rotation)
  const update = useScreenSettingsStore((s) => s.update)
  const push = useScreenPush()
  const [pending180, setPending180] = useState(false)
  const select = (deg: Rotation) => {
    if (rotation === deg) return
    update({ rotation: deg })
    if (deg === 180) {
      setPending180(true)
      return
    }
    void push(deg)
  }
  const confirm180 = () => {
    setPending180(false)
    void push(180)
  }
  return {
    rotation,
    select,
    pending180,
    setPending180,
    confirm180,
  }
}

export const useThemeChoice = () => {
  const canDeviceAction = useCanDeviceAction()
  const { isDayMode, setIsDayMode } = useDeviceState()
  const { isPreviewDayMode, togglePreviewTheme } = usePreviewTheme()
  const log = useLogStore((s) => s.push)
  return async (target: ThemeMode) => {
    const day = target === 'day'
    if (!canDeviceAction) {
      if (isPreviewDayMode !== day) togglePreviewTheme()
      return
    }
    if (isDayMode === day) return
    const result = await usbService.setDayNight(day)
    if (!result.success) {
      log('error', `Theme set failed: ${transportErrorText(result.error)}`)
      return
    }
    setIsDayMode(day)
    log('success', `Theme set to ${target}`)
  }
}

export const useCalibration = () => {
  const canDeviceAction = useCanDeviceAction()
  const log = useLogStore((s) => s.push)
  const [calibrating, setCalibrating] = useState(false)
  const [pending, setPending] = useState(false)
  const confirm = async () => {
    setPending(false)
    setCalibrating(true)
    const result = await usbService.calibrateTouch()
    setCalibrating(false)
    if (result.success) {
      log('info', 'Touch calibration started — follow the crosshairs on the device')
      return
    }
    log('error', `Calibration failed: ${transportErrorText(result.error)}`)
  }
  const request = () => {
    if (canDeviceAction) setPending(true)
  }
  return { canDeviceAction, calibrating, pending, setPending, request, confirm }
}
