const EVENTS = {
  mouse: { move: 'mousemove', up: 'mouseup' },
  pointer: { move: 'pointermove', up: 'pointerup' },
} as const

export type PointerFamily = keyof typeof EVENTS

export interface PointerHandlers {
  onMove: (ev: MouseEvent) => void
  onUp: (ev: MouseEvent) => void
}

export const followPointer = (family: PointerFamily, handlers: PointerHandlers): void => {
  const { move, up } = EVENTS[family]
  const finish = (ev: MouseEvent) => {
    window.removeEventListener(move, handlers.onMove)
    window.removeEventListener(up, finish)
    handlers.onUp(ev)
  }
  window.addEventListener(move, handlers.onMove)
  window.addEventListener(up, finish)
}
