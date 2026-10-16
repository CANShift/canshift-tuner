import { STRINGS } from '../../strings'
import { useConnectionStore } from '../../stores/connection.store'
import { UiIcon } from '../icons/UiIcons'

export const ReconnectBanner = () => {
  const reconnecting = useConnectionStore((s) => s.status === 'reconnecting')
  if (!reconnecting) return null
  return (
    <div
      role="status"
      className="flex shrink-0 items-start gap-2.5 bg-app-warning-bg px-4 py-3 text-sm leading-snug text-app-warning-ink"
    >
      <UiIcon name="wifiOff" className="mt-px size-[18px]" />
      <span>{STRINGS.reconnectBanner}</span>
    </div>
  )
}
