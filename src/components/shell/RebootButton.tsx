import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDeviceStore } from '../../stores/device.store'
import { useLogStore } from '../../stores/log.store'
import { usbService } from '../../transport'
import { errorMessage } from '../../lib/error-message'
import { transportErrorText } from '../../transport/humanize-transport-error'

export interface RebootButtonProps {
  label?: string
}

const requestReboot = async (): Promise<void> => {
  const log = useLogStore.getState().push
  log('info', 'Reboot requested')
  try {
    const result = await usbService.reboot()
    if (result.success) {
      log('success', 'Reboot command sent — dash is restarting')
      return
    }
    log('error', `Reboot failed: ${transportErrorText(result.error)}`)
  } catch (err) {
    log('error', `Reboot failed: ${errorMessage(err)}`)
  }
}

export const RebootButton = ({ label = 'Reboot' }: RebootButtonProps) => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const [rebooting, setRebooting] = useState(false)
  const reboot = () => {
    setRebooting(true)
    void requestReboot().finally(() => setRebooting(false))
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={!connected || simulationMode || rebooting}
      onClick={reboot}
      aria-busy={rebooting}
    >
      {rebooting ? 'Rebooting…' : label}
    </Button>
  )
}
