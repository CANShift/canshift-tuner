import { useEffect } from 'react'
import { useDeviceStore } from '../stores/device.store'
import { useDashboardStore } from '../stores/dashboard.store'
import { useLogStore } from '../stores/log.store'
import { deviceIpc } from '../transport'
import type { DeviceConfigResult } from '../transport/types'
import { errorMessage } from '../lib/error-message'
import { transportErrorText } from '../transport/humanize-transport-error'

interface BootstrapDeps {
  loadFromDeviceOrDemo: ReturnType<typeof useDashboardStore.getState>['loadFromDeviceOrDemo']
  markDirty: () => void
  log: ReturnType<typeof useLogStore.getState>['push']
}

const applyOkResult = (
  result: Extract<DeviceConfigResult, { kind: 'ok' }>,
  deps: BootstrapDeps
) => {
  const outcome = deps.loadFromDeviceOrDemo(result.config)
  if (outcome === 'staged') {
    deps.log('warn', 'Device config differs from your unsaved edits — choose which to keep')
    return
  }
  if (outcome !== 'device') return
  deps.log('success', 'Loaded config from device')
  if (result.migrationsApplied.length === 0) return
  deps.markDirty()
  deps.log(
    'info',
    `Device config migrated (${result.migrationsApplied.join(', ')}) — burn to persist the upgrade`
  )
}

const loadDemoFallback = (deps: BootstrapDeps, reason: string) => {
  const outcome = deps.loadFromDeviceOrDemo(null)
  if (outcome === 'demo') deps.log('info', reason)
}

const RESULT_HANDLERS: Record<
  DeviceConfigResult['kind'],
  (result: DeviceConfigResult, deps: BootstrapDeps) => void
> = {
  ok: (result, deps) => {
    if (result.kind === 'ok') applyOkResult(result, deps)
  },
  none: (_result, deps) => {
    loadDemoFallback(deps, 'Device has no config — loaded demo')
  },
  error: (result, deps) => {
    if (result.kind !== 'error') return
    deps.log('error', `Device config is unreadable or invalid: ${transportErrorText(result.error)}`)
    loadDemoFallback(deps, 'Loaded demo config instead')
  },
}

export const useDeviceConfigBootstrap = (): void => {
  const connected = useDeviceStore((s) => s.connected)
  const transport = useDeviceStore((s) => s.transport)
  const loadFromDeviceOrDemo = useDashboardStore((s) => s.loadFromDeviceOrDemo)
  const markDirty = useDashboardStore((s) => s.markDirty)
  const log = useLogStore((s) => s.push)

  useEffect(() => {
    if (!connected || transport !== 'usb') return
    let cancelled = false
    const deps: BootstrapDeps = { loadFromDeviceOrDemo, markDirty, log }
    void deviceIpc
      .getConfig()
      .then((result) => {
        if (cancelled) return
        RESULT_HANDLERS[result.kind](result, deps)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        log('error', `Failed to read device config: ${errorMessage(err)}`)
      })
    return () => {
      cancelled = true
    }
  }, [connected, transport, loadFromDeviceOrDemo, markDirty, log])
}
