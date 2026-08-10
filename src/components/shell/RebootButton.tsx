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

export const RebootButton = ({ label = 'Reboot' }: RebootButtonProps) => {
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const log = useLogStore((s) => s.push)
  const [rebooting, setRebooting] = useState(false)

  const disabled = !connected || simulationMode || rebooting

  const handleClick = () => {
    setRebooting(true)
    log('info', 'Reboot requested')
    void usbService
      .reboot()
      .then((result) => {
        if (result.success) {
          log('success', 'Reboot command sent — dash is restarting')
        } else {
          log('error', `Reboot failed: ${transportErrorText(result.error)}`)
        }
      })
      .catch((err: unknown) => {
        const message = errorMessage(err)
        log('error', `Reboot failed: ${message}`)
      })
      .finally(() => {
        setRebooting(false)
      })
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={disabled}
      onClick={handleClick}
      aria-busy={rebooting}
    >
      {rebooting ? 'Rebooting…' : label}
    </Button>
  )
}
