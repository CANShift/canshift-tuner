import { useEffect, type ReactNode } from 'react'
import { useFirmwareStore, type FirmwareView } from '../../stores/firmware.store'
import { FirmwareRunning } from './FirmwareRunning'
import { FirmwareFailed, FirmwareSuccess } from './FirmwareOutcome'

type Running = Extract<FirmwareView, { kind: 'running' }>

const RunningColumn = ({ view }: { view: Running }) => (
  <div className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-6 px-6 pb-10 pt-12 lg:pt-20">
    <FirmwareRunning view={view} />
  </div>
)

const BODIES: Record<FirmwareView['kind'], (view: FirmwareView) => ReactNode> = {
  choosing: () => null,
  confirming: () => null,
  running: (view) => (view.kind === 'running' ? <RunningColumn view={view} /> : null),
  success: () => <FirmwareSuccess reconnected />,
  reconnect: () => <FirmwareSuccess reconnected={false} />,
  failed: (view) => (view.kind === 'failed' ? <FirmwareFailed failure={view.failure} /> : null),
}

const useLeaveGuard = (running: boolean): void => {
  useEffect(() => {
    if (!running) return
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', guard)
    return () => {
      window.removeEventListener('beforeunload', guard)
    }
  }, [running])
}

export const FirmwareOverlay = () => {
  const view = useFirmwareStore((s) => s.view)
  useLeaveGuard(view.kind === 'running')
  const body = BODIES[view.kind](view)
  if (body === null) return null
  return (
    <div className="fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col overflow-y-auto bg-app-bg lg:top-16">
      {body}
    </div>
  )
}
