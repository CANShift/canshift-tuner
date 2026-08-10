import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  migrateLegacyKeys,
  projectStorageKey,
  readItem,
  readJson,
  removeItem,
  STORAGE_KEYS,
  writeItem,
} from './local-storage'

const memoryStorage = (): Storage => {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => {
      map.clear()
    },
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => {
      map.delete(k)
    },
    setItem: (k: string, v: string) => {
      map.set(k, v)
    },
  }
}

const throwingStorage = (): Storage =>
  ({
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('quota')
    },
    removeItem: () => {
      throw new Error('blocked')
    },
  }) as unknown as Storage

beforeEach(() => {
  globalThis.localStorage = memoryStorage()
})

describe('every key lives under one namespace', () => {
  it('has no key outside canshift.tuner.', () => {
    const strays = Object.values(STORAGE_KEYS).filter((k) => !k.startsWith('canshift.tuner.'))
    expect(strays).toEqual([])
  })

  it('namespaces project keys too', () => {
    expect(projectStorageKey('abc')).toBe('canshift.tuner.project.abc')
  })

  it('has no duplicate key', () => {
    const values = Object.values(STORAGE_KEYS)
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('storage access never throws', () => {
  it('reads null and reports a failed write when localStorage is blocked', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    globalThis.localStorage = throwingStorage()

    expect(readItem('x')).toBeNull()
    expect(writeItem('x', '1')).toBe(false)
    expect(() => {
      removeItem('x')
    }).not.toThrow()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('readJson rejects malformed JSON and values failing the guard', () => {
    const isNumber = (v: unknown): v is number => typeof v === 'number'
    writeItem('k', '{oops')
    expect(readJson('k', isNumber)).toBeNull()
    writeItem('k', '"a string"')
    expect(readJson('k', isNumber)).toBeNull()
    writeItem('k', '42')
    expect(readJson('k', isNumber)).toBe(42)
  })
})

describe('legacy keys migrate once, without data loss', () => {
  it('moves a legacy value to its namespaced key and drops the old one', () => {
    localStorage.setItem('cs-left-nav-collapsed', '1')
    localStorage.setItem('canshift:signal-store-v1', '{"a":1}')
    localStorage.setItem('canshift.log.verbose', '1')

    migrateLegacyKeys()

    expect(readItem(STORAGE_KEYS.leftNavCollapsed)).toBe('1')
    expect(readItem(STORAGE_KEYS.signals)).toBe('{"a":1}')
    expect(readItem(STORAGE_KEYS.logVerbose)).toBe('1')
    expect(localStorage.getItem('cs-left-nav-collapsed')).toBeNull()
    expect(localStorage.getItem('canshift:signal-store-v1')).toBeNull()
  })

  it('never overwrites a value already stored under the new key', () => {
    writeItem(STORAGE_KEYS.theme, 'light')
    localStorage.setItem('canshift.tuner.theme', 'light')
    localStorage.setItem('cs-left-nav-collapsed', '1')
    writeItem(STORAGE_KEYS.leftNavCollapsed, '0')

    migrateLegacyKeys()

    expect(readItem(STORAGE_KEYS.leftNavCollapsed)).toBe('0')
    expect(localStorage.getItem('cs-left-nav-collapsed')).toBeNull()
  })

  it('is idempotent — a second run changes nothing', () => {
    localStorage.setItem('tuner.feedback.dismissed-hint', '1')
    migrateLegacyKeys()
    const after = readItem(STORAGE_KEYS.feedbackDismissedHint)
    migrateLegacyKeys()
    expect(readItem(STORAGE_KEYS.feedbackDismissedHint)).toBe(after)
    expect(after).toBe('1')
  })

  it('does nothing when there is no legacy data', () => {
    migrateLegacyKeys()
    expect(readItem(STORAGE_KEYS.leftNavCollapsed)).toBeNull()
  })
})
