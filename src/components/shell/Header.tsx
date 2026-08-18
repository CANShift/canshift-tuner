import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HeaderView, type HeaderLinkProps, type HeaderStatus } from './HeaderView'
import { ConfigNameField } from './ConfigNameField'
import { SaveButton } from './SaveButton'
import { BurnButton as UiBurnButton, BurnSuccessPill } from './BurnButton'
import { useConnectionStore } from '../../stores/connection.store'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDeviceStore } from '../../stores/device.store'
import { useThemeStore } from '../../stores/theme.store'
import { useUiStore } from '../../stores/ui.store'
import { ThemeToggleButton } from './ThemeToggleButton'
import { useProjectStore } from '../../stores/project/project.store'
import { useBurnDashboard } from '../../hooks/useBurnDashboard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const BURN_SUCCESS_FLASH_MS = 2_500
const BURN_DENIED_SHAKE_MS = 400

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

const useBurnDeniedShake = (): boolean => {
  const burnDeniedAt = useUiStore((s) => s.burnDeniedAt)
  const [shaking, setShaking] = useState(false)
  useEffect(() => {
    if (burnDeniedAt === null) return
    setShaking(true)
    const timer = setTimeout(() => {
      setShaking(false)
    }, BURN_DENIED_SHAKE_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [burnDeniedAt])
  return shaking
}

const BurnButton = () => {
  const { canBurn, isBurning, burn, requestBurn } = useBurnDashboard()
  const lastBurnResult = useDeviceStore((s) => s.lastBurnResult)
  const unboundBurnConfirm = useUiStore((s) => s.unboundBurnConfirm)
  const clearUnboundBurnConfirm = useUiStore((s) => s.clearUnboundBurnConfirm)
  useBurnSuccessAutoClear()
  const shaking = useBurnDeniedShake()

  const title = isBurning
    ? 'Burning dashboard to the device…'
    : canBurn
      ? 'Burn dashboard to device (Cmd/Ctrl+S)'
      : 'Connect a device and edit the dashboard to enable Burn'
  return (
    <span className="flex items-stretch">
      {lastBurnResult?.kind === 'success' && (
        <span className="flex items-center px-3">
          <BurnSuccessPill />
        </span>
      )}
      <span
        className="flex"
        // eslint-disable-next-line no-inline-style/no-inline-style
        style={
          shaking
            ? { animation: `canshift-tuner-shake ${BURN_DENIED_SHAKE_MS}ms ease-in-out` }
            : undefined
        }
      >
        <UiBurnButton disabled={!canBurn} busy={isBurning} title={title} onClick={requestBurn} />
      </span>
      <AlertDialog
        open={unboundBurnConfirm !== null}
        onOpenChange={(open) => {
          if (!open) clearUnboundBurnConfirm()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {String(unboundBurnConfirm ?? 0)} widget
              {(unboundBurnConfirm ?? 0) === 1 ? ' has' : 's have'} no signal bound
            </AlertDialogTitle>
            <AlertDialogDescription>
              Unbound widgets render “--” on the device. You can bind them by dragging a signal from
              the Signals tab onto each widget, or burn as-is.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearUnboundBurnConfirm()
                void burn()
              }}
            >
              Burn anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  )
}

export default Header
