import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HeaderView, type HeaderLinkProps, type HeaderStatus } from './HeaderView'
import { ConfigNameField } from './ConfigNameField'
import { SaveButton } from './SaveButton'
import { BurnButton as UiBurnButton, BurnSuccessPill } from './BurnButton'
import { useConnectionStore } from '../../stores/connection.store'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDeviceStore } from '../../stores/device.store'
import { useThemeStore } from '../../stores/theme.store'
import { ThemeToggleButton } from './ThemeToggleButton'
import { useProjectStore } from '../../stores/project/project.store'
import { useBurnDashboard } from '../../hooks/useBurnDashboard'
import { burnLabel, burnTitle } from '../../lib/burn-verdict'

const BURN_SUCCESS_FLASH_MS = 2_500

const HeaderLink = ({ to, className, children, ...rest }: HeaderLinkProps) => (
  <Link to={to} className={className} {...rest}>
    {children}
  </Link>
)

const Header = () => {
  const status = useConnectionStore((s) => s.status)
  const disconnect = useConnectionStore((s) => s.disconnect)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const exitSimulation = useDeviceStore((s) => s.exitSimulation)
  const configName = useDashboardStore((s) => s.config?.name ?? null)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const renameProject = useProjectStore((s) => s.renameProject)
  const saveActiveProject = useProjectStore((s) => s.saveActiveProject)
  const location = useLocation()

  const live = status === 'connected' || status === 'reconnecting'
  const resolvedStatus: HeaderStatus = simulationMode ? 'simulation' : status

  const handleDisconnect = () => {
    if (simulationMode) {
      exitSimulation()
      return
    }
    disconnect()
  }

  return (
    <HeaderView
      activePath={location.pathname}
      gatingActive={!live && !simulationMode}
      status={resolvedStatus}
      configNameField={
        configName !== null && activeProjectId !== null ? (
          <ConfigNameField
            name={configName}
            onCommit={(name) => {
              renameProject(activeProjectId, name)
            }}
          />
        ) : null
      }
      themeToggle={<ThemeToggle />}
      saveButton={<SaveButton disabled={configName === null} onSave={saveActiveProject} />}
      burnButton={<BurnButton />}
      {...(live || simulationMode ? { onDisconnect: handleDisconnect } : {})}
      LinkComponent={HeaderLink}
    />
  )
}

const ThemeToggle = () => {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  return <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
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
