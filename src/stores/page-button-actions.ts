import type { PageButtonRole } from '@canshift/core'
import { buttonSignal, type WheelButtonMapping } from '../lib/car/wheel-buttons'
import { pageButtonSignal, shouldUnmap } from '../lib/car/page-buttons'
import { useDashboardStore } from './dashboard.store'
import { useSignalStore } from './signal.store'

const currentButtons = () => useDashboardStore.getState().config?.pageButtons ?? {}

export const savePageButton = (role: PageButtonRole, mapping: WheelButtonMapping): void => {
  const name = pageButtonSignal(currentButtons(), role)
  const { signals, putSignal } = useSignalStore.getState()
  putSignal(
    buttonSignal(
      name,
      mapping,
      signals.find((signal) => signal.name === name)
    )
  )
  useDashboardStore.getState().setPageButton(role, name)
}

export const removePageButton = (role: PageButtonRole): void => {
  const buttons = currentButtons()
  const name = buttons[role]
  if (name !== undefined && shouldUnmap(buttons, role)) useSignalStore.getState().removeSignal(name)
  useDashboardStore.getState().setPageButton(role, null)
}
