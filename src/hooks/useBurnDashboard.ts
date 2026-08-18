import { useCallback, useMemo } from 'react'
import type { DashboardConfig } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useDeviceStore, type BurnPhase, type BurnResult } from '../stores/device.store'
import { useConnectionStore } from '../stores/connection.store'
import { useSignalStore } from '../stores/signal.store'
import { useLogStore, type LogLevel } from '../stores/log.store'
import { usbService } from '../transport'
import { BURN_COMMAND } from '../transport/chunked-config'
import { humanizeTransportError } from '../transport/humanize-transport-error'
import { verifyBurnedConfig, type VerifyResult } from '../lib/verify-burned-config'
import { describeBurnFailure, type BurnFailure } from '../lib/burn-failure'
import { burnBlocks, burnVerdict, type BurnVerdict } from '../lib/burn-verdict'
import { captureFlowEvent } from '../lib/posthog'
import { errorMessage } from '../lib/error-message'

const VERIFY_COMMAND = 'GET_CONFIG'

interface UseBurnDashboard {
  verdict: BurnVerdict
  canBurn: boolean
  isBurning: boolean
  burn: () => Promise<void>
  requestBurn: () => void
}

type VerifyFailure = Exclude<VerifyResult, { kind: 'ok' }>

interface BurnSteps {
  log: (level: LogLevel, message: string) => void
  markPushed: () => void
  setBurnPhase: (phase: BurnPhase) => void
  setLastBurnResult: (result: BurnResult | null) => void
  fail: (failure: BurnFailure, outcome: string, detail: string | undefined) => void
}

const verifyDetail = (verify: VerifyFailure): string | undefined =>
  verify.kind === 'fetch_failed' ? humanizeTransportError(verify.error) : undefined

const runBurn = async (config: DashboardConfig, steps: BurnSteps): Promise<void> => {
  const pushed = await usbService.pushConfig(config)
  if (pushed.kind === 'error') {
    const failure = describeBurnFailure({
      stage: 'push',
      command: BURN_COMMAND,
      code: pushed.code,
      chunk: pushed.chunk,
    })
    steps.fail(failure, 'push_failed', pushed.detail)
    return
  }
  steps.setBurnPhase('verifying')
  steps.log('info', 'Burn acked — verifying on device…')
  const verify = await verifyBurnedConfig(config)
  if (verify.kind !== 'ok') {
    const failure = describeBurnFailure({
      stage: 'verify',
      command: VERIFY_COMMAND,
      code: verify.kind,
    })
    steps.fail(failure, 'verify_failed', verifyDetail(verify))
    return
  }
  steps.markPushed()
  steps.log('success', 'Dashboard burned + verified on device')
  steps.setLastBurnResult({ kind: 'success' })
  captureFlowEvent('burn_completed', { outcome: 'success' })
}

const buildSteps = (deps: Omit<BurnSteps, 'fail'>): BurnSteps => ({
  ...deps,
  fail: (failure, outcome, detail) => {
    const suffix = detail === undefined ? '' : ` (${detail})`
    deps.log('error', `Burn failed: ${failure.body}${suffix}`)
    deps.setLastBurnResult({ kind: 'error', failure })
    captureFlowEvent('burn_completed', { outcome, reason: failure.code })
  },
})

export const useBurnDashboard = (): UseBurnDashboard => {
  const config = useDashboardStore((s) => s.config)
  const isDirty = useDashboardStore((s) => s.isDirty)
  const markPushed = useDashboardStore((s) => s.markPushed)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const firmwareCompat = useDeviceStore((s) => s.firmwareCompat)
  const connectionStatus = useConnectionStore((s) => s.status)
  const signals = useSignalStore((s) => s.signals)
  const log = useLogStore((s) => s.push)

  const burnPhase = useDeviceStore((s) => s.burnPhase)
  const setBurnPhase = useDeviceStore((s) => s.setBurnPhase)
  const setLastBurnResult = useDeviceStore((s) => s.setLastBurnResult)
  const isBurning = burnPhase !== 'idle'

  const verdict = useMemo(
    () =>
      burnVerdict({
        hasDevice: connected && connectionStatus === 'connected',
        simulation: simulationMode,
        firmwareMismatch: firmwareCompat.kind === 'mismatch',
        config,
        signals,
        isDirty,
      }),
    [connected, connectionStatus, simulationMode, firmwareCompat.kind, config, signals, isDirty]
  )

  const canBurn = !isBurning && !burnBlocks(verdict)

  const burn = useCallback(async () => {
    if (!canBurn || !config) return
    if (useDeviceStore.getState().burnPhase !== 'idle') return
    setBurnPhase('pushing')
    setLastBurnResult(null)
    const steps = buildSteps({ log, markPushed, setBurnPhase, setLastBurnResult })
    try {
      await runBurn(config, steps)
    } catch (err) {
      const failure = describeBurnFailure({
        stage: 'push',
        command: BURN_COMMAND,
        code: 'exception',
      })
      steps.fail(failure, 'exception', errorMessage(err))
    } finally {
      setBurnPhase('idle')
    }
  }, [canBurn, config, markPushed, log, setBurnPhase, setLastBurnResult])

  const requestBurn = useCallback(() => {
    if (!canBurn) return
    void burn()
  }, [canBurn, burn])

  return { verdict, canBurn, isBurning, burn, requestBurn }
}
