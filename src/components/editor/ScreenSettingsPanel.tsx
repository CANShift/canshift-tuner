import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { SCREEN_SETTINGS_BOUNDS } from '@canshift/core'
import { useBrightnessDraft } from '../../hooks/useSettingsDraft'
import { useActiveDayMode } from '../../hooks/useActiveDayMode'
import { SegmentedPair, SettingRow } from './screen-settings-controls'
import { ConfirmDialog } from './screen-settings/ConfirmDialog'
import {
  useCalibration,
  useRotationChoice,
  useThemeChoice,
  type Rotation,
  type ThemeMode,
} from './screen-settings/use-screen-settings-actions'

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

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'night', label: 'Night' },
  { value: 'day', label: 'Day' },
]

const ROTATION_OPTIONS: { value: Rotation; label: string }[] = [
  { value: 0, label: '0°' },
  { value: 180, label: '180°' },
]

interface ScreenSettingsPanelProps {
  scale: number
}

const BrightnessRow = ({ scale }: { scale: number }) => {
  const brightness = useBrightnessDraft()
  return (
    <SettingRow label="BRIGHTNESS" value={`${String(brightness.value)}%`} scale={scale}>
      <input
        type="range"
        min={SCREEN_SETTINGS_BOUNDS.brightnessMinPct}
        max={SCREEN_SETTINGS_BOUNDS.brightnessMaxPct}
        value={brightness.value}
        onChange={(e) => {
          brightness.set(Number(e.target.value))
        }}
        className="w-full cursor-pointer accent-[#CC3333]"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ height: Math.round(scale * 3) }}
      />
    </SettingRow>
  )
}

const ThemeRow = ({ scale }: { scale: number }) => {
  const activeDayMode = useActiveDayMode()
  const selectTheme = useThemeChoice()
  return (
    <SettingRow label="THEME" value={activeDayMode ? 'Day' : 'Night'} scale={scale}>
      <SegmentedPair
        options={THEME_OPTIONS}
        activeValue={activeDayMode ? 'day' : 'night'}
        scale={scale}
        onSelect={(mode) => {
          void selectTheme(mode)
        }}
      />
    </SettingRow>
  )
}

const TouchRow = ({
  scale,
  calibration,
}: {
  scale: number
  calibration: ReturnType<typeof useCalibration>
}) => (
  <SettingRow label="TOUCH" value="" scale={scale}>
    <button
      type="button"
      onClick={calibration.request}
      disabled={!calibration.canDeviceAction || calibration.calibrating}
      className={cn(
        calibrateButton({ enabled: calibration.canDeviceAction, busy: calibration.calibrating })
      )}
      // eslint-disable-next-line no-inline-style/no-inline-style
      style={{ padding: `${String(Math.round(scale * 2))}px 0`, fontSize: Math.round(scale * 6) }}
    >
      {calibration.calibrating ? '...' : 'CALIBRATE'}
    </button>
  </SettingRow>
)

const SettingsDialogs = ({
  rotation,
  calibration,
}: {
  rotation: ReturnType<typeof useRotationChoice>
  calibration: ReturnType<typeof useCalibration>
}) => (
  <>
    <ConfirmDialog
      open={rotation.pending180}
      onOpenChange={rotation.setPending180}
      title="Switching mounting orientation reboots the device"
      description="Switching mounting orientation to 180° reboots the device and clears the touch calibration. You will be asked to re-calibrate on the next boot."
      cancelLabel="Keep current"
      confirmLabel="Reboot and continue"
      onConfirm={rotation.confirm180}
    />
    <ConfirmDialog
      open={calibration.pending}
      onOpenChange={calibration.setPending}
      title="Start touch calibration on the device"
      description="Calibration starts on the device. Tap each crosshair on the dashboard screen."
      cancelLabel="Cancel"
      confirmLabel="Continue"
      onConfirm={() => void calibration.confirm()}
    />
  </>
)

const Heading = ({ scale }: { scale: number }) => (
  <span
    className={HEADING}
    // eslint-disable-next-line no-inline-style/no-inline-style
    style={{ fontSize: Math.round(scale * 7), marginBottom: Math.round(scale * 2) }}
  >
    SCREEN SETTINGS
  </span>
)

const MountingRow = ({
  scale,
  rotation,
}: {
  scale: number
  rotation: ReturnType<typeof useRotationChoice>
}) => (
  <SettingRow label="MOUNTING" value={rotation.rotation === 180 ? '180°' : '0°'} scale={scale}>
    <SegmentedPair<Rotation>
      options={ROTATION_OPTIONS}
      activeValue={rotation.rotation === 180 ? 180 : 0}
      scale={scale}
      onSelect={rotation.select}
    />
  </SettingRow>
)

const ScreenSettingsPanel = ({ scale }: ScreenSettingsPanelProps) => {
  const rotation = useRotationChoice()
  const calibration = useCalibration()
  return (
    <>
      <div
        className={OVERLAY}
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={{ padding: Math.round(scale * 8), gap: Math.round(scale * 6) }}
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
      >
        <Heading scale={scale} />
        <BrightnessRow scale={scale} />
        <ThemeRow scale={scale} />
        <MountingRow scale={scale} rotation={rotation} />
        <TouchRow scale={scale} calibration={calibration} />
      </div>
      <SettingsDialogs rotation={rotation} calibration={calibration} />
    </>
  )
}

export default ScreenSettingsPanel
