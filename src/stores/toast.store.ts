import { create } from 'zustand'

export const TOAST_MS = 4_000

export interface Toast {
  id: number
  message: string
}

interface ToastState {
  toast: Toast | null
  show: (message: string) => void
  dismiss: (id: number) => void
}

let nextToastId = 1

export const useToastStore = create<ToastState>()((set, get) => ({
  toast: null,
  show: (message) => set({ toast: { id: nextToastId++, message } }),
  dismiss: (id) => {
    if (get().toast?.id === id) set({ toast: null })
  },
}))
