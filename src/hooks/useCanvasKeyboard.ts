import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react'
import type { Widget } from '@canshift/core'
import { useDashboardStore } from '../stores/dashboard.store'
import { useUndoToastStore } from '../stores/undo-toast.store'
import { isEditableTarget } from '../utils/is-editable-target'

export interface CanvasKeyboardRef {
  pageId: string
  pageWidgets: readonly Widget[]
}

export interface UseCanvasKeyboardOptions {
  selectWidget: (widgetId: string | null) => void
  selectWidgets: (widgetIds: string[]) => void
  removeWidgets: (pageId: string, widgetIds: string[]) => void
  nudgeWidgets: (pageId: string, widgetIds: string[], dx: number, dy: number) => void
  kbdRef: RefObject<CanvasKeyboardRef>
  setShortcutsOpen: Dispatch<SetStateAction<boolean>>
}

interface ShortcutContext {
  event: KeyboardEvent
  activeIds: string[]
  kbd: CanvasKeyboardRef | null
  options: UseCanvasKeyboardOptions
}

interface Shortcut {
  match: (ctx: ShortcutContext) => boolean
  run: (ctx: ShortcutContext) => void
}

const ARROW_DELTAS: Record<string, { dx: number; dy: number }> = {
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
}

const NUDGE_STEP = 1
const NUDGE_STEP_FAST = 3

const isMod = (e: KeyboardEvent): boolean => e.metaKey || e.ctrlKey

const SHORTCUTS: Shortcut[] = [
  {
    match: ({ event }) => event.key === 'Escape',
    run: ({ options }) => {
      options.setShortcutsOpen(false)
      options.selectWidget(null)
    },
  },
  {
    match: ({ event }) => event.key === '?',
    run: ({ options }) => {
      options.setShortcutsOpen((o) => !o)
    },
  },
  {
    match: ({ event }) => isMod(event) && ['z', 'y'].includes(event.key.toLowerCase()),
    run: ({ event }) => {
      const { undo, redo } = useDashboardStore.getState()
      const isRedo = event.key.toLowerCase() === 'y' || event.shiftKey
      if (isRedo) redo()
      else undo()
    },
  },
  {
    match: ({ event, kbd }) => kbd !== null && isMod(event) && event.key === 'a',
    run: ({ kbd, options }) => {
      const allIds = kbd?.pageWidgets.map((w) => w.id) ?? []
      if (allIds.length > 0) options.selectWidgets(allIds)
    },
  },
  {
    match: ({ event, kbd, activeIds }) =>
      kbd !== null && activeIds.length > 0 && ['Delete', 'Backspace'].includes(event.key),
    run: ({ kbd, activeIds, options }) => {
      if (!kbd) return
      options.removeWidgets(kbd.pageId, activeIds)
      useUndoToastStore.getState().showForLastAction()
    },
  },
  {
    match: ({ event, kbd, activeIds }) =>
      kbd !== null && activeIds.length > 0 && event.key in ARROW_DELTAS,
    run: ({ event, kbd, activeIds, options }) => {
      const delta = ARROW_DELTAS[event.key]
      if (!kbd || !delta) return
      const step = event.shiftKey ? NUDGE_STEP_FAST : NUDGE_STEP
      options.nudgeWidgets(kbd.pageId, activeIds, delta.dx * step, delta.dy * step)
    },
  },
]

export const useCanvasKeyboard = (options: UseCanvasKeyboardOptions): void => {
  const { selectWidget, selectWidgets, removeWidgets, nudgeWidgets, kbdRef, setShortcutsOpen } =
    options

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      const ctx: ShortcutContext = {
        event,
        activeIds: useDashboardStore.getState().selectedWidgetIds,
        kbd: kbdRef.current,
        options: {
          selectWidget,
          selectWidgets,
          removeWidgets,
          nudgeWidgets,
          kbdRef,
          setShortcutsOpen,
        },
      }
      const shortcut = SHORTCUTS.find((s) => s.match(ctx))
      if (!shortcut) return
      event.preventDefault()
      event.stopPropagation()
      shortcut.run(ctx)
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [selectWidget, selectWidgets, removeWidgets, nudgeWidgets, kbdRef, setShortcutsOpen])
}
