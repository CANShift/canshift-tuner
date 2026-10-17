import {
  WHEEL_BUTTON_SIGNALS,
  type PageButtonRole,
  type PageButtons,
  type SignalDef,
  type WheelButtonSignal,
} from '@canshift/core'
import {
  isPressed,
  isWheelButton,
  wheelButtonMapping,
  type WheelButtonMapping,
} from './wheel-buttons'

export const PAGE_BUTTON_ROLES: readonly PageButtonRole[] = ['next', 'previous']

const OTHER_ROLE: Record<PageButtonRole, PageButtonRole> = { next: 'previous', previous: 'next' }

const PREFERRED_SLOT: Record<PageButtonRole, WheelButtonSignal> = {
  next: 'wheel_button_1',
  previous: 'wheel_button_2',
}

export interface PageButtonState {
  role: PageButtonRole
  signal: string
  assigned: boolean
  mapping: WheelButtonMapping | null
  pressed: boolean
}

const freeSlot = (buttons: PageButtons, role: PageButtonRole): WheelButtonSignal => {
  const taken = buttons[OTHER_ROLE[role]]
  const preferred = PREFERRED_SLOT[role]
  if (preferred !== taken) return preferred
  return WHEEL_BUTTON_SIGNALS.find((slot) => slot !== taken) ?? preferred
}

export const pageButtonSignal = (buttons: PageButtons, role: PageButtonRole): string =>
  buttons[role] ?? freeSlot(buttons, role)

export const shouldUnmap = (buttons: PageButtons, role: PageButtonRole): boolean => {
  const signal = buttons[role]
  return signal !== undefined && isWheelButton(signal) && buttons[OTHER_ROLE[role]] !== signal
}

const mappingOf = (signals: readonly SignalDef[], name: string): WheelButtonMapping | null => {
  const signal = signals.find((candidate) => candidate.name === name)
  return signal === undefined ? null : wheelButtonMapping(signal)
}

export const pageButtonState = (
  role: PageButtonRole,
  buttons: PageButtons,
  signals: readonly SignalDef[],
  live: Readonly<Record<string, number>>
): PageButtonState => {
  const signal = pageButtonSignal(buttons, role)
  const assigned = buttons[role] !== undefined
  return {
    role,
    signal,
    assigned,
    mapping: assigned ? mappingOf(signals, signal) : null,
    pressed: assigned && isPressed(live[signal]),
  }
}
