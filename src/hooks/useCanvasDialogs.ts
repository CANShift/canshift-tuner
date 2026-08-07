import { useMemo, useReducer } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export type DialogKey = 'settingsOpen' | 'diagOpen' | 'shortcutsOpen'

export type DialogState = Record<DialogKey, boolean>

export interface DialogAction {
  key: DialogKey
  value: SetStateAction<boolean>
}

export const INITIAL_DIALOG_STATE: DialogState = {
  settingsOpen: false,
  diagOpen: false,
  shortcutsOpen: false,
}

export const dialogReducer = (state: DialogState, { key, value }: DialogAction): DialogState => {
  const next = typeof value === 'function' ? value(state[key]) : value
  return state[key] === next ? state : { ...state, [key]: next }
}

export interface CanvasDialogs extends DialogState {
  setSettingsOpen: Dispatch<SetStateAction<boolean>>
  setDiagOpen: Dispatch<SetStateAction<boolean>>
  setShortcutsOpen: Dispatch<SetStateAction<boolean>>
}

export const useCanvasDialogs = (): CanvasDialogs => {
  const [state, dispatch] = useReducer(dialogReducer, INITIAL_DIALOG_STATE)

  const setters = useMemo(
    () => ({
      setSettingsOpen: (value: SetStateAction<boolean>) => {
        dispatch({ key: 'settingsOpen', value })
      },
      setDiagOpen: (value: SetStateAction<boolean>) => {
        dispatch({ key: 'diagOpen', value })
      },
      setShortcutsOpen: (value: SetStateAction<boolean>) => {
        dispatch({ key: 'shortcutsOpen', value })
      },
    }),
    []
  )

  return { ...state, ...setters }
}
