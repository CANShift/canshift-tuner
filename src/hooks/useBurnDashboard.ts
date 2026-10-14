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
  fail: (failure: BurnFailure, detail: string | undefined) => void
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
    steps.fail(failure, pushed.detail)
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
    steps.fail(failure, verifyDetail(verify))
    return
  }
  steps.markPushed()
  steps.log('success', 'Dashboard burned + verified on device')
  steps.setLastBurnResult({ kind: 'success' })
}

const buildSteps = (deps: Omit<BurnSteps, 'fail'>): BurnSteps => ({
  ...deps,
  fail: (failure, detail) => {
    const suffix = detail === undefined ? '' : ` (${detail})`
    deps.log('error', `Burn failed: ${failure.body}${suffix}`)
    deps.setLastBurnResult({ kind: 'error', failure })
  },
})

const useBurnVerdict = (): BurnVerdict => {
  const config = useDashboardStore((s) => s.config)
  const isDirty = useDashboardStore((s) => s.isDirty)
  const connected = useDeviceStore((s) => s.connected)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const firmwareMismatch = useDeviceStore((s) => s.firmwareCompat.kind === 'mismatch')
  const connectionStatus = useConnectionStore((s) => s.status)
  const signals = useSignalStore((s) => s.signals)
  return useMemo(
    () =>
      burnVerdict({
        hasDevice: connected && connectionStatus === 'connected',
        simulation: simulationMode,
        firmwareMismatch,
        config,
        signals,
        isDirty,
      }),
    [connected, connectionStatus, simulationMode, firmwareMismatch, config, signals, isDirty]
  )
}

const burnException = (steps: BurnSteps, err: unknown) => {
  const failure = describeBurnFailure({ stage: 'push', command: BURN_COMMAND, code: 'exception' })
  steps.fail(failure, errorMessage(err))
}

const useBurnSteps = (): BurnSteps => {
  const markPushed = useDashboardStore((s) => s.markPushed)
  const setBurnPhase = useDeviceStore((s) => s.setBurnPhase)
  const setLastBurnResult = useDeviceStore((s) => s.setLastBurnResult)
  const log = useLogStore((s) => s.push)
  return useMemo(
    () => buildSteps({ log, markPushed, setBurnPhase, setLastBurnResult }),
    [log, markPushed, setBurnPhase, setLastBurnResult]
  )
}

export const useBurnDashboard = (): UseBurnDashboard => {
  const config = useDashboardStore((s) => s.config)
  const isBurning = useDeviceStore((s) => s.burnPhase !== 'idle')
  const verdict = useBurnVerdict()
  const steps = useBurnSteps()
  const canBurn = !isBurning && !burnBlocks(verdict)

  const burn = useCallback(async () => {
    if (!canBurn || !config) return
    if (useDeviceStore.getState().burnPhase !== 'idle') return
    steps.setBurnPhase('pushing')
    steps.setLastBurnResult(null)
    try {
      await runBurn(config, steps)
    } catch (err) {
      burnException(steps, err)
    } finally {
      steps.setBurnPhase('idle')
    }
  }, [canBurn, config, steps])

  const requestBurn = useCallback(() => {
    if (!canBurn) return
    void burn()
  }, [canBurn, burn])

  return { verdict, canBurn, isBurning, burn, requestBurn }
}
