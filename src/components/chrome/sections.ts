import type { UiIconName } from '../icons/UiIcons'
import type { ChangeSection } from '../../lib/sync/change'
import { STRINGS } from '../../strings'

export interface Section {
  id: ChangeSection
  path: string
  label: string
  icon: UiIconName
}

export const SECTIONS: readonly Section[] = [
  { id: 'gauges', path: '/gauges', label: STRINGS.tabs.gauges, icon: 'gauges' },
  { id: 'car', path: '/car', label: STRINGS.tabs.car, icon: 'car' },
  { id: 'dash', path: '/dash', label: STRINGS.tabs.dash, icon: 'dash' },
]
