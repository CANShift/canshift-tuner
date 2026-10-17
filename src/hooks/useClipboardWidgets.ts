import { useEffect } from 'react'
import { useDashboardStore } from '../stores/dashboard.store'
import { isEditableTarget } from '../utils/is-editable-target'

export interface UseClipboardWidgetsOptions {
  pageId: string | null
  enabled: boolean
}

type ClipboardKind = 'copy' | 'cut' | 'paste'
type ClipboardHandler = (e: ClipboardEvent) => void

const CLIPBOARD_EVENTS: readonly ClipboardKind[] = ['copy', 'cut', 'paste']

const whenSelected =
  (pageId: string, act: (pageId: string, ids: string[]) => void): ClipboardHandler =>
  (e) => {
    if (isEditableTarget(e.target)) return
    const ids = useDashboardStore.getState().selectedWidgetIds
    if (ids.length === 0) return
    e.preventDefault()
    act(pageId, ids)
  }

const whenClipboardFilled =
  (pageId: string): ClipboardHandler =>
  (e) => {
    if (isEditableTarget(e.target)) return
    const { clipboardWidgets, pasteWidgets } = useDashboardStore.getState()
    if (clipboardWidgets.length === 0) return
    e.preventDefault()
    pasteWidgets(pageId)
  }

const clipboardHandlers = (pageId: string): Record<ClipboardKind, ClipboardHandler> => {
  const store = useDashboardStore.getState()
  return {
    copy: whenSelected(pageId, store.copyWidgets),
    cut: whenSelected(pageId, (id, ids) => {
      store.copyWidgets(id, ids)
      store.removeWidgets(id, ids)
    }),
    paste: whenClipboardFilled(pageId),
  }
}

export const useClipboardWidgets = ({ pageId, enabled }: UseClipboardWidgetsOptions): void => {
  useEffect(() => {
    if (!enabled || pageId === null) return
    const handlers = clipboardHandlers(pageId)
    CLIPBOARD_EVENTS.forEach((kind) => {
      document.addEventListener(kind, handlers[kind])
    })
    return () => {
      CLIPBOARD_EVENTS.forEach((kind) => {
        document.removeEventListener(kind, handlers[kind])
      })
    }
  }, [pageId, enabled])
}
