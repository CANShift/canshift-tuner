import { useLocation } from 'react-router-dom'
import { FooterView } from './FooterView'
import { useUiStore } from '../../stores/ui.store'

export const Footer = () => {
  const cliOpen = useUiStore((s) => s.cliOpen)
  const toggleCli = useUiStore((s) => s.toggleCli)
  const location = useLocation()

  if (location.pathname !== '/dash') return null
  return <FooterView cliOpen={cliOpen} onToggleCli={toggleCli} />
}
