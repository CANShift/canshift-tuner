import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { UNDO_TOAST_MS, useUndoToastStore } from '../../stores/undo-toast.store'

const TOAST = [
  'fixed bottom-[52px] left-1/2 z-[200] flex -translate-x-1/2 items-center gap-3 px-3.5 py-[9px]',
  'border border-solid border-brand-neutral-400 bg-brand-chrome-surface',
  'shadow-[0_4px_16px_rgba(0,0,0,0.4)]',
].join(' ')

const LABEL = 'whitespace-nowrap text-[12px] text-brand-text'

const UNDO_BUTTON = [
  'cursor-pointer border border-solid border-brand-accent bg-transparent px-3 py-1',
  'text-[11px] font-extrabold tracking-[0.09em] text-brand-accent',
].join(' ')

const DISMISS = 'cursor-pointer border-none bg-transparent p-0 text-[11px] text-brand-neutral-500'

export const UndoToast = () => {
  const toast = useUndoToastStore((s) => s.toast)
  const undoFromToast = useUndoToastStore((s) => s.undoFromToast)
  const dismiss = useUndoToastStore((s) => s.dismiss)

  useEffect(() => {
    if (!toast) return
    const id = toast.id
    const timer = window.setTimeout(() => {
      dismiss(id)
    }, UNDO_TOAST_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [toast, dismiss])

  if (!toast) return null

  return (
    <div role="status" className={TOAST}>
      <span className={LABEL}>{toast.label}</span>
      <button
        type="button"
        className={cn('editor-ghost-accent', UNDO_BUTTON)}
        onClick={undoFromToast}
      >
        UNDO
      </button>
      <button
        type="button"
        onClick={() => {
          dismiss(toast.id)
        }}
        aria-label="Dismiss"
        className={DISMISS}
      >
        ✕
      </button>
    </div>
  )
}
