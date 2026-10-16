import type { ChangeSection, ChangeText } from './describe'
import type { SetupPath } from './setup-path'

export type ChangeRevert = { kind: 'path'; path: SetupPath } | { kind: 'order' } | { kind: 'whole' }

export interface ChangeTarget {
  pageId: string
  widgetId?: string
}

export interface Change extends ChangeText {
  id: string
  revert: ChangeRevert
  target: ChangeTarget | null
}

export type { ChangeSection }
