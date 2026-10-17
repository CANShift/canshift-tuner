import { WHEEL_BUTTON_SIGNALS, type WheelButtonSignal } from '@canshift/core'
import { useSignalStore } from '../stores/signal.store'
import { useLiveSignals } from './useLiveSignals'
import {
  isPressed,
  wheelButtonMapping,
  wheelButtonSignal,
  type WheelButtonMapping,
} from '../lib/car/wheel-buttons'

export interface WheelButtonSlot {
  slot: WheelButtonSignal
  mapping: WheelButtonMapping | null
  pressed: boolean
}

export interface WheelButtonsEditor {
  slots: readonly WheelButtonSlot[]
  map: (slot: WheelButtonSignal, mapping: WheelButtonMapping) => void
  unmap: (slot: WheelButtonSignal) => void
}

export const useWheelButtons = (): WheelButtonsEditor => {
  const signals = useSignalStore((s) => s.signals)
  const putSignal = useSignalStore((s) => s.putSignal)
  const removeSignal = useSignalStore((s) => s.removeSignal)
  const live = useLiveSignals()
  const slots = WHEEL_BUTTON_SIGNALS.map((slot) => {
    const signal = signals.find((s) => s.name === slot)
    return {
      slot,
      mapping: signal === undefined ? null : wheelButtonMapping(signal),
      pressed: isPressed(live[slot]),
    }
  })
  return {
    slots,
    map: (slot, mapping) => {
      putSignal(wheelButtonSignal(slot, mapping))
    },
    unmap: removeSignal,
  }
}
