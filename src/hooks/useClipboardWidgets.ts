import { useEffect } from 'react'
import { useDashboardStore } from '../stores/dashboard.store'
import { isEditableTarget } from '../utils/is-editable-target'

export interface UseClipboardWidgetsOptions {
  copyWidgets: (pageId: string, widgetIds: string[]) => void
  removeWidgets: (pageId: string, widgetIds: string[]) => void
  pasteWidgets: (pageId: string) => void
}

type ClipboardKind = 'copy' | 'cut' | 'paste'
type ClipboardHandler = (e: ClipboardEvent) => void

const CLIPBOARD_EVENTS: readonly ClipboardKind[] = ['copy', 'cut', 'paste']

const whenSelected =
  (act: (pageId: string, ids: string[]) => void): ClipboardHandler =>
  (e) => {
    if (isEditableTarget(e.target)) return
    const { selectedWidgetIds: ids, selectedPageId } = useDashboardStore.getState()
    if (ids.length === 0 || !selectedPageId) return
    e.preventDefault()
    act(selectedPageId, ids)
  }

const whenClipboardFilled =
  (paste: (pageId: string) => void): ClipboardHandler =>
  (e) => {
    if (isEditableTarget(e.target)) return
    const { clipboardWidgets, selectedPageId } = useDashboardStore.getState()
    if (clipboardWidgets.length === 0 || !selectedPageId) return
    e.preventDefault()
    paste(selectedPageId)
  }

const clipboardHandlers = (
  options: UseClipboardWidgetsOptions
): Record<ClipboardKind, ClipboardHandler> => ({
  copy: whenSelected(options.copyWidgets),
  cut: whenSelected((pageId, ids) => {
    options.copyWidgets(pageId, ids)
    options.removeWidgets(pageId, ids)
  }),
  paste: whenClipboardFilled(options.pasteWidgets),
})

export const useClipboardWidgets = ({
  copyWidgets,
  removeWidgets,
  pasteWidgets,
}: UseClipboardWidgetsOptions): void => {
  useEffect(() => {
    const handlers = clipboardHandlers({ copyWidgets, removeWidgets, pasteWidgets })
    CLIPBOARD_EVENTS.forEach((kind) => {
      document.addEventListener(kind, handlers[kind])
    })
    return () => {
      CLIPBOARD_EVENTS.forEach((kind) => {
        document.removeEventListener(kind, handlers[kind])
      })
    }
  }, [copyWidgets, removeWidgets, pasteWidgets])
}
