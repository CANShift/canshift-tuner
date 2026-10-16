import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { STRINGS } from '../../strings'
import { useConnection, type Connection } from '../../hooks/useConnection'
import { UiIcon } from '../icons/UiIcons'
import { StatusDot } from './StatusDot'
import { useDeviceStore } from '../../stores/device.store'

interface IndicatorLook {
  label: string
  mark: ReactNode
  tone: string
}

const LOOKS: Record<Connection, IndicatorLook> = {
  connected: {
    label: STRINGS.connection.connected,
    mark: <StatusDot tone="success" />,
    tone: 'text-app-text',
  },
  reconnecting: {
    label: STRINGS.connection.reconnecting,
    mark: <UiIcon name="refresh" className="size-4 animate-spin [animation-duration:2s]" />,
    tone: 'text-app-warning',
  },
  offline: {
    label: STRINGS.connection.offline,
    mark: <StatusDot tone="hollow" />,
    tone: 'text-app-text',
  },
}

export interface ConnectionIndicatorProps {
  pill?: boolean
}

const INDICATOR = 'inline-flex items-center gap-2 text-[15px] font-semibold'

const PILL = 'h-8 rounded-full border border-app-border bg-app-surface px-3 text-sm'

export const ConnectionIndicator = ({ pill = false }: ConnectionIndicatorProps) => {
  const { connection, editingOffline } = useConnection()
  const stopEditingOffline = useDeviceStore((s) => s.exitSimulation)
  const look = LOOKS[connection]
  const className = cn(INDICATOR, look.tone, pill && PILL)
  if (!editingOffline) {
    return (
      <span role="status" className={className}>
        {look.mark}
        {look.label}
      </span>
    )
  }
  return (
    <button type="button" className={cn(className, 'min-h-11')} onClick={stopEditingOffline}>
      {look.mark}
      {look.label}
    </button>
  )
}
