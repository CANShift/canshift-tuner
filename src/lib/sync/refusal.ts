import type { ChangeSection, ChangeTarget } from './change'

export interface Refusal {
  where: string
  text: string
  target: ChangeTarget | null
  section: ChangeSection
  title?: string
}

export type SendFailure = { kind: 'refused'; reasons: Refusal[] } | { kind: 'dropped' }
