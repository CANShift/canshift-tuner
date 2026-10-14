import type { ButtonAction } from '@canshift/core'

import { newId } from './id'

const actionKeys = new WeakMap<ButtonAction, string>()

const memoizedKey = <T extends object>(cache: WeakMap<T, string>, item: T): string => {
  const existing = cache.get(item)
  if (existing !== undefined) return existing
  const generated = newId()
  cache.set(item, generated)
  return generated
}

export const actionKey = (action: ButtonAction): string =>
  action.id ?? memoizedKey(actionKeys, action)
