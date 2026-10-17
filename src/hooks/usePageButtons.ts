import type { PageButtonRole } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'

export interface PageButtonsEditor {
  signalOf: (role: PageButtonRole) => string | undefined
  set: (role: PageButtonRole, signal: string | null) => void
}

export const usePageButtons = (): PageButtonsEditor => {
  const buttons = useDashboardStore((s) => s.config?.pageButtons)
  const setPageButton = useDashboardStore((s) => s.setPageButton)
  return {
    signalOf: (role) => buttons?.[role],
    set: setPageButton,
  }
}
