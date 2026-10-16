import type { ChangeTarget } from './change'

export interface Refusal {
  where: string
  text: string
  target: ChangeTarget | null
}

export type SendFailure = { kind: 'refused'; reasons: Refusal[] } | { kind: 'dropped' }
