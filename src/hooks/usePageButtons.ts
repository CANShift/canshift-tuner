import type { PageButtonRole } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useSignalStore } from '../stores/signal.store'
import { removePageButton, savePageButton } from '../stores/page-button-actions'
import { useLiveSignals } from './useLiveSignals'
import type { WheelButtonMapping } from '../lib/car/wheel-buttons'
import { PAGE_BUTTON_ROLES, pageButtonState, type PageButtonState } from '../lib/car/page-buttons'

export interface PageButtonsEditor {
  buttons: readonly PageButtonState[]
  save: (role: PageButtonRole, mapping: WheelButtonMapping) => void
  remove: (role: PageButtonRole) => void
}

export const usePageButtons = (): PageButtonsEditor => {
  const buttons = useDashboardStore((s) => s.config?.pageButtons) ?? {}
  const signals = useSignalStore((s) => s.signals)
  const live = useLiveSignals()
  return {
    buttons: PAGE_BUTTON_ROLES.map((role) => pageButtonState(role, buttons, signals, live)),
    save: savePageButton,
    remove: removePageButton,
  }
}
