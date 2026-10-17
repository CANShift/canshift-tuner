import type { PageButtonRole } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useWheelButtons, type WheelButtonSlot } from './useWheelButtons'

export interface PageButtonsEditor {
  slots: readonly WheelButtonSlot[]
  signalOf: (role: PageButtonRole) => string | undefined
  set: (role: PageButtonRole, signal: string | null) => void
}

export const usePageButtons = (): PageButtonsEditor => {
  const buttons = useDashboardStore((s) => s.config?.pageButtons)
  const setPageButton = useDashboardStore((s) => s.setPageButton)
  const { slots } = useWheelButtons()
  return {
    slots,
    signalOf: (role) => buttons?.[role],
    set: setPageButton,
  }
}
