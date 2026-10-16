import { useEffect } from 'react'
import { TOAST_MS, useToastStore } from '../../stores/toast.store'
import { UiIcon } from '../icons/UiIcons'

export const Toaster = () => {
  const toast = useToastStore((s) => s.toast)
  const dismiss = useToastStore((s) => s.dismiss)
  useEffect(() => {
    if (toast === null) return
    const timer = setTimeout(() => {
      dismiss(toast.id)
    }, TOAST_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [toast, dismiss])
  if (toast === null) return null
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(170px+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-[12px] border border-app-border bg-app-surface-2 px-4 py-3 text-[15px] shadow-lg lg:bottom-6"
    >
      <UiIcon name="check" className="text-app-success" />
      <span>{toast.message}</span>
    </div>
  )
}
