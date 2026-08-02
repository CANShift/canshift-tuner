import type { Widget } from '@canshift/core'
import { displayLabelForSignal } from '../../../utils/signal-labels'

export interface BaseRendererProps {
  widget: Widget
  w: number
  h: number
}

export const formatSignalLabel = (signal: string): string => {
  return displayLabelForSignal(signal)
}
