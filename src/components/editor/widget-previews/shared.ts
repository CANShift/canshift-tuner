import type { Widget } from '@canshift/core'
import { signalDisplayLabel } from '@canshift/core'

export interface BaseRendererProps {
  widget: Widget
  w: number
  h: number
}

export const formatSignalLabel = (signal: string): string => {
  return signalDisplayLabel(signal)
}
