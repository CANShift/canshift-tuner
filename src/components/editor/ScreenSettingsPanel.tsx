import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { SCREEN_SETTINGS_BOUNDS } from '@canshift/core'
import { useScreenSettingsStore } from '../../stores/screen-settings.store'
import { useLogStore } from '../../stores/log.store'
import { useDeviceState } from '../../hooks/useDeviceState'
import { usePreviewTheme } from '../../hooks/useDashboardConfig'
import { useActiveDayMode } from '../../hooks/useActiveDayMode'
import { usbService } from '../../transport'
import { transportErrorText } from '../../transport/humanize-transport-error'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SegmentedPair, SettingRow } from './screen-settings-controls'

const OVERLAY = 'absolute inset-0 z-50 box-border flex flex-col overflow-y-auto bg-[#0D0D0D]'

const HEADING = 'font-extrabold tracking-[0.05em] text-[#CCCCCC]'

const calibrateButton = cva('w-full border border-solid bg-[#111111] leading-none', {
  variants: {
    enabled: {
      true: 'border-[#2A2A2A] text-[#AAAAAA]',
      false: 'border-[#1E1E1E] text-[#444444]',
    },
    busy: { true: 'cursor-default', false: '' },
  },
  compoundVariants: [{ enabled: true, busy: false, class: 'cursor-pointer' }],
  defaultVariants: { enabled: false, busy: false },
})

interface ScreenSettingsPanelProps {
  scale: number
}

const ScreenSettingsPanel = ({ scale }: ScreenSettingsPanelProps) => {
  const brightness = useScreenSettingsStore((s) => s.brightness)
  const rotation = useScreenSettingsStore((s) => s.rotation)
  const updateScreenSettings = useScreenSettingsStore((s) => s.update)
  const { connected, simulationMode, isDayMode, setIsDayMode } = useDeviceState()
  const { isPreviewDayMode, togglePreviewTheme } = usePreviewTheme()
  const log = useLogStore((s) => s.push)
  const [calibrating, setCalibrating] = useState(false)
  const [pendingRotation180, setPendingRotation180] = useState(false)
  const [pendingCalibration, setPendingCalibration] = useState(false)

  const fs = Math.round(scale * 6)
  const fsLg = Math.round(scale * 7)
  const gap = Math.round(scale * 6)

  const pushScreenSettings = async (nextRotation = rotation) => {
    if (simulationMode || !connected) return
    const result = await usbService.pushScreenSettings({
      brightness,
      rotation: nextRotation,
    })
    if (result.success) {
      log('success', `Screen settings pushed — brightness ${String(brightness)}%`)
    } else {
      log('error', `Screen settings push failed: ${transportErrorText(result.error)}`)
    }
  }

  const handleBrightnessCommit = () => {
    void pushScreenSettings()
  }

  const handleRotationSelect = (deg: 0 | 180) => {
    if (rotation === deg) return
    updateScreenSettings({ rotation: deg })
    if (deg === 180) {
      setPendingRotation180(true)
      return
    }
    void pushScreenSettings(deg)
  }

  const handleConfirmRotation180 = () => {
    setPendingRotation180(false)
    void pushScreenSettings(180)
  }

  const canDeviceAction = connected && !simulationMode

  const activeDayMode = useActiveDayMode()

  const handleSelectMode = async (target: 'night' | 'day') => {
    const day = target === 'day'
    if (!canDeviceAction) {
      if (isPreviewDayMode !== day) togglePreviewTheme()
      return
    }
    if (isDayMode === day) return
    const result = await usbService.setDayNight(day)
    if (result.success) {
      setIsDayMode(day)
      log('success', `Theme set to ${target}`)
    } else {
      log('error', `Theme set failed: ${transportErrorText(result.error)}`)
    }
  }

  const handleCalibrate = () => {
    if (!canDeviceAction) return
    setPendingCalibration(true)
  }

  const handleConfirmCalibration = async () => {
    setPendingCalibration(false)
    setCalibrating(true)
    const result = await usbService.calibrateTouch()
    setCalibrating(false)
    if (result.success) {
      log('info', 'Touch calibration started — follow the crosshairs on the device')
    } else {
      log('error', `Calibration failed: ${transportErrorText(result.error)}`)
    }
  }

  return (
    <>
      <div
        className={OVERLAY}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ padding: Math.round(scale * 8), gap }}
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
      >
        <span
          className={HEADING}
          // eslint-disable-next-line no-inline-style/no-inline-style
          style={{ fontSize: fsLg, marginBottom: Math.round(scale * 2) }}
        >
          SCREEN SETTINGS
        </span>

        <SettingRow label="BRIGHTNESS" value={`${String(brightness)}%`} scale={scale}>
          <input
            type="range"
            min={SCREEN_SETTINGS_BOUNDS.brightnessMinPct}
            max={SCREEN_SETTINGS_BOUNDS.brightnessMaxPct}
            value={brightness}
            onChange={(e) => {
              updateScreenSettings({ brightness: Number(e.target.value) })
            }}
            onMouseUp={handleBrightnessCommit}
            onTouchEnd={handleBrightnessCommit}
            onKeyUp={handleBrightnessCommit}
            className="w-full cursor-pointer accent-[#CC3333]"
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ height: Math.round(scale * 3) }}
          />
        </SettingRow>

        <SettingRow label="THEME" value={activeDayMode ? 'Day' : 'Night'} scale={scale}>
          <SegmentedPair
            options={[
              { value: 'night', label: 'Night' },
              { value: 'day', label: 'Day' },
            ]}
            activeValue={activeDayMode ? 'day' : 'night'}
            scale={scale}
            onSelect={(mode) => {
              void handleSelectMode(mode)
            }}
          />
        </SettingRow>

        <SettingRow label="MOUNTING" value={rotation === 180 ? '180°' : '0°'} scale={scale}>
          <SegmentedPair<0 | 180>
            options={[
              { value: 0, label: '0°' },
              { value: 180, label: '180°' },
            ]}
            activeValue={rotation === 180 ? 180 : 0}
            scale={scale}
            onSelect={(deg) => {
              handleRotationSelect(deg)
            }}
          />
        </SettingRow>

        <SettingRow label="TOUCH" value="" scale={scale}>
          <button
            type="button"
            onClick={handleCalibrate}
            disabled={!canDeviceAction || calibrating}
            className={cn(calibrateButton({ enabled: canDeviceAction, busy: calibrating }))}
            // eslint-disable-next-line no-inline-style/no-inline-style
            style={{ padding: `${String(Math.round(scale * 2))}px 0`, fontSize: fs }}
          >
            {calibrating ? '...' : 'CALIBRATE'}
          </button>
        </SettingRow>
      </div>
      <AlertDialog open={pendingRotation180} onOpenChange={setPendingRotation180}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switching mounting orientation reboots the device</AlertDialogTitle>
            <AlertDialogDescription>
              Switching mounting orientation to 180° reboots the device and clears the touch
              calibration. You will be asked to re-calibrate on the next boot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRotation180}>
              Reboot and continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={pendingCalibration} onOpenChange={setPendingCalibration}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start touch calibration on the device</AlertDialogTitle>
            <AlertDialogDescription>
              Calibration starts on the device. Tap each crosshair on the dashboard screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleConfirmCalibration()
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ScreenSettingsPanel
