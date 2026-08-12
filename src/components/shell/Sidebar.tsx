import { NavLink, useLocation } from 'react-router-dom'
import { SidebarView, type SidebarLinkProps } from './SidebarView'
import { resolveTargetLabel } from './target-label'
import { CollapseRail } from './CollapseRail'
import { useConnectionStore } from '../../stores/connection.store'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useDeviceStore } from '../../stores/device.store'
import { useUiStore } from '../../stores/ui.store'

const RouterLink = ({ to, className, children, title }: SidebarLinkProps) => (
  <NavLink to={to} end={to === '/'} className={className} title={title}>
    {children}
  </NavLink>
)

const Sidebar = () => {
  const status = useConnectionStore((s) => s.status)
  const simulationMode = useDeviceStore((s) => s.simulationMode)
  const firmwareVersion = useDeviceStore((s) => s.firmwareVersion)
  const targetProfile = useDashboardStore((s) => s.config?.targetProfile)
  const location = useLocation()
  const collapsed = useUiStore((s) => s.leftNavCollapsed)
  const toggleLeftNav = useUiStore((s) => s.toggleLeftNav)
  const offline = status !== 'connected' && !simulationMode
  const targetLabel = resolveTargetLabel(offline, targetProfile)

  if (collapsed) {
    return <CollapseRail side="left" label="Menu" onExpand={toggleLeftNav} />
  }

  return (
    <SidebarView
      activeRoute={location.pathname}
      offline={offline}
      targetLabel={targetLabel}
      firmwareVersion={firmwareVersion}
      LinkComponent={RouterLink}
      onCollapse={toggleLeftNav}
    />
  )
}

export default Sidebar
