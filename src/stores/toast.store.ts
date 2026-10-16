import { create } from 'zustand'

export const TOAST_MS = 4_000

export type ToastTone = 'success' | 'warning'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface ToastState {
  toast: Toast | null
  show: (message: string, tone?: ToastTone) => void
  dismiss: (id: number) => void
}

let nextToastId = 1

export const useToastStore = create<ToastState>()((set, get) => ({
  toast: null,
  show: (message, tone = 'success') => set({ toast: { id: nextToastId++, message, tone } }),
  dismiss: (id) => {
    if (get().toast?.id === id) set({ toast: null })
  },
}))
