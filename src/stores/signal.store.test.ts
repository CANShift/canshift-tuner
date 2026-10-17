import { beforeEach, describe, expect, it } from 'vitest'
import type { SignalDef } from '@canshift/core'
import { useSignalStore } from './signal.store'
import { wheelButtonSignal } from '../lib/car/wheel-buttons'

const rpm = { name: 'rpm' } as SignalDef

beforeEach(() => {
  useSignalStore.setState({ signals: [rpm] })
})

describe('putSignal', () => {
  it('appends a new signal and replaces one with the same name', () => {
    const first = wheelButtonSignal('wheel_button_1', { frameId: 0x1a0, byte: 0, bit: 0 })
    const moved = wheelButtonSignal('wheel_button_1', { frameId: 0x1a0, byte: 2, bit: 4 })
    useSignalStore.getState().putSignal(first)
    useSignalStore.getState().putSignal(moved)
    expect(useSignalStore.getState().signals).toEqual([rpm, moved])
  })
})

describe('removeSignal', () => {
  it('drops the named signal and keeps the rest', () => {
    useSignalStore
      .getState()
      .putSignal(wheelButtonSignal('wheel_button_2', { frameId: 0x2f0, byte: 1, bit: null }))
    useSignalStore.getState().removeSignal('wheel_button_2')
    expect(useSignalStore.getState().signals).toEqual([rpm])
  })
})
