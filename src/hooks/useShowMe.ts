import { useNavigate } from 'react-router-dom'
import { SECTIONS } from '../components/chrome/sections'
import type { Refusal } from '../lib/sync/refusal'
import { useDashboardStore } from '../stores/dashboard.store'
import { dismissSendOutcome } from '../stores/sync/send-actions'

export const useShowMe = (): ((refusal: Refusal | undefined) => void) => {
  const navigate = useNavigate()
  return (refusal) => {
    dismissSendOutcome()
    if (refusal === undefined) return
    const section = SECTIONS.find((candidate) => candidate.id === refusal.section)
    if (section !== undefined) void navigate(section.path)
    if (refusal.target === null) return
    useDashboardStore.getState().selectPage(refusal.target.pageId)
    useDashboardStore.getState().selectWidget(refusal.target.widgetId ?? null)
  }
}
