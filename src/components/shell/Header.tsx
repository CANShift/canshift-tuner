import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HeaderView, type HeaderLinkProps, type HeaderStatus } from './HeaderView'
import { ConfigNameField } from './ConfigNameField'
import { SaveButton } from './SaveButton'
import { BurnButton as UiBurnButton, BurnSuccessPill } from './BurnButton'
import { useConnectionStore } from '../../stores/connection.store'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDeviceStore } from '../../stores/device.store'
import { useProjectStore } from '../../stores/project/project.store'
import { useBurnDashboard } from '../../hooks/useBurnDashboard'
import { burnLabel, burnTitle } from '../../lib/burn-verdict'

const BURN_SUCCESS_FLASH_MS = 2_500

const HeaderLink = ({ to, className, children, ...rest }: HeaderLinkProps) => (
  <Link to={to} className={className} {...rest}>
    {children}
  </Link>
)

const HeaderConfigName = () => {
  const configName = useDashboardStore((s) => s.config?.name ?? null)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const renameProject = useProjectStore((s) => s.renameProject)
  if (configName === null || activeProjectId === null) return null
  return (
    <ConfigNameField
      name={configName}
      onCommit={(name) => {
        renameProject(activeProjectId, name)
      }}
    />
  )
}

const HeaderSave = () => {
  const hasConfig = useDashboardStore((s) => s.config !== null)
  const saveActiveProject = useProjectStore((s) => s.saveActiveProject)
  return <SaveButton disabled={!hasConfig} onSave={saveActiveProject} />
}

const useDisconnectAction = (): (() => void) | null => {
  const status = useConnectionStore((s) => s.status)
  const disconnect = useConnectionStore((s) => s.disconnect)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const exitSimulation = useDeviceStore((s) => s.exitSimulation)
  if (simulationMode) return exitSimulation
  const live = status === 'connected' || status === 'reconnecting'
  return live ? disconnect : null
}

const Header = () => {
  const status = useConnectionStore((s) => s.status)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const location = useLocation()
  const onDisconnect = useDisconnectAction()
  const resolvedStatus: HeaderStatus = simulationMode ? 'simulation' : status

  return (
    <HeaderView
      activePath={location.pathname}
      gatingActive={onDisconnect === null}
      status={resolvedStatus}
      configNameField={<HeaderConfigName />}
      saveButton={<HeaderSave />}
      burnButton={<BurnButton />}
      {...(onDisconnect === null ? {} : { onDisconnect })}
      LinkComponent={HeaderLink}
    />
  )
}

const useBurnSuccessAutoClear = (): void => {
  const lastBurnResult = useDeviceStore((s) => s.lastBurnResult)
  const setLastBurnResult = useDeviceStore((s) => s.setLastBurnResult)
  useEffect(() => {
    if (lastBurnResult?.kind !== 'success') return
    const timer = setTimeout(() => {
      setLastBurnResult(null)
    }, BURN_SUCCESS_FLASH_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [lastBurnResult, setLastBurnResult])
}

const BurnButton = () => {
  const { verdict, canBurn, isBurning, requestBurn } = useBurnDashboard()
  const lastBurnResult = useDeviceStore((s) => s.lastBurnResult)
  useBurnSuccessAutoClear()

  return (
    <span className="flex items-stretch">
      {lastBurnResult?.kind === 'success' && (
        <span className="flex items-center px-3">
          <BurnSuccessPill />
        </span>
      )}
      <span className="flex">
        <UiBurnButton
          disabled={!canBurn}
          busy={isBurning}
          title={burnTitle(verdict)}
          label={burnLabel(verdict)}
          onClick={requestBurn}
        />
      </span>
    </span>
  )
}

export default Header
