import { describe, expect, it } from 'vitest'
import { STRINGS } from './strings'

const leaves = (node: unknown): unknown[] =>
  typeof node === 'object' && node !== null ? Object.values(node).flatMap(leaves) : [node]

const SAMPLE_ARGS = ['Boost', 'Race']

const rendered = (leaf: unknown): string =>
  typeof leaf === 'function' ? String(leaf(...SAMPLE_ARGS)) : String(leaf)

describe('the copy deck', () => {
  it('counts unsent changes in the singular and the plural', () => {
    expect(STRINGS.sync.notSent(1)).toBe('1 change not sent')
    expect(STRINGS.sync.notSent(3)).toBe('3 changes not sent')
  })

  it('reassures with the right verb for one change', () => {
    expect(STRINGS.notConnected.safe(1)).toBe(
      'Your 1 change is safe in this browser. You can keep editing.'
    )
    expect(STRINGS.notConnected.safe(2)).toBe(
      'Your 2 changes are safe in this browser. You can keep editing.'
    )
  })

  it('names the gauge and the page in a refusal', () => {
    expect(STRINGS.refused.unknownSignal('Boost', 'Race')).toBe(
      'Boost on page Race uses a signal your car doesn’t send. Choose another signal or remove the gauge.'
    )
  })

  it('leaves no unfilled hole and no empty string', () => {
    const texts = leaves(STRINGS).map(rendered)
    expect(texts.filter((text) => text.length === 0 || /[{}]/.test(text))).toEqual([])
  })
})
