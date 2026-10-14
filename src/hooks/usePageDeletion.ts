import { useCallback, useEffect } from 'react'
import { useDashboardStore } from '../stores/dashboard.store'
import { useUndoToastStore } from '../stores/undo-toast.store'
import { isEditableTarget } from '../utils/is-editable-target'

const DELETE_KEYS = new Set(['Delete', 'Backspace'])

export const useDeletePage = (): ((pageId: string) => void) => {
  const removePage = useDashboardStore((s) => s.removePage)
  const showUndoToast = useUndoToastStore((s) => s.showForLastAction)
  return useCallback(
    (pageId: string) => {
      removePage(pageId)
      showUndoToast()
    },
    [removePage, showUndoToast]
  )
}

const deletableSelectedPage = (event: KeyboardEvent): string | null => {
  if (!DELETE_KEYS.has(event.key) || isEditableTarget(event.target)) return null
  const { selectedPageId, selectedWidgetId, config } = useDashboardStore.getState()
  if (selectedWidgetId !== null || selectedPageId === null) return null
  return (config?.pages.length ?? 0) > 1 ? selectedPageId : null
}

export const useDeletePageKey = (deletePage: (pageId: string) => void): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const pageId = deletableSelectedPage(event)
      if (pageId !== null) deletePage(pageId)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [deletePage])
}
