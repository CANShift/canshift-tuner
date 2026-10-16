import { useNavigate } from 'react-router-dom'
import type { ChangeTarget } from '../lib/sync/change'
import { useDashboardStore } from '../stores/dashboard.store'
import { dismissSendOutcome } from '../stores/sync/send-actions'

const GAUGES_PATH = '/gauges'

export const useShowMe = (): ((target: ChangeTarget | null) => void) => {
  const navigate = useNavigate()
  return (target) => {
    dismissSendOutcome()
    void navigate(GAUGES_PATH)
    if (target === null) return
    useDashboardStore.getState().selectPage(target.pageId)
    useDashboardStore.getState().selectWidget(target.widgetId ?? null)
  }
}
