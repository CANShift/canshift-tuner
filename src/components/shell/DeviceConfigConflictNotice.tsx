import { InlineState } from '@/components/states/InlineState'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useLogStore } from '../../stores/log.store'

export const DeviceConfigConflictNotice = () => {
  const pendingDeviceConfig = useDashboardStore((s) => s.pendingDeviceConfig)
  const acceptPendingDeviceConfig = useDashboardStore((s) => s.acceptPendingDeviceConfig)
  const dismissPendingDeviceConfig = useDashboardStore((s) => s.dismissPendingDeviceConfig)
  const log = useLogStore((s) => s.push)

  if (pendingDeviceConfig === null) return null

  return (
    <InlineState
      className="shrink-0"
      severity="warning"
      kicker="USB CDC · CONFIG DIFFERS"
      title="The device config is not the one you are editing"
      body="The connected device sent a dashboard config, but you have unsaved edits. Loading from the device will discard your edits. Keeping your edits leaves the device untouched until you burn."
      primaryAction={{
        label: 'LOAD FROM DEVICE',
        onClick: () => {
          acceptPendingDeviceConfig()
          log('success', 'Loaded config from device — local edits discarded')
        },
      }}
      secondaryAction={{
        label: 'Keep my edits',
        onClick: () => {
          dismissPendingDeviceConfig()
          log('info', 'Kept local edits — device config ignored')
        },
      }}
    />
  )
}
