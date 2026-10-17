import { beforeEach, describe, expect, it } from 'vitest'
import type { DashboardConfig, PageButtons, SignalDef } from '@canshift/core'
import { wheelButtonSignal } from '../lib/car/wheel-buttons'
import { useDashboardStore } from './dashboard.store'
import { useSignalStore } from './signal.store'
import { removePageButton, savePageButton } from './page-button-actions'

const rpm = { name: 'rpm' } as SignalDef
const cruise = {
  ...wheelButtonSignal('flag_cruise', { frameId: 0x300, byte: 1, bit: 2 }),
  scale: 2,
}
const first = { frameId: 0x1a2, byte: 3, bit: 0 }
const second = { frameId: 0x2f0, byte: 1, bit: null }

const configWith = (pageButtons: PageButtons): DashboardConfig =>
  ({
    version: '1.23.0',
    defaultPageId: 'p1',
    topBar: { height: 16, bgColor: '#000000', textColor: '#FFFFFF' },
    pages: [{ id: 'p1', backgroundColor: '#000000', showTopBar: true, visible: true, widgets: [] }],
    pageButtons,
  }) as unknown as DashboardConfig

const start = (pageButtons: PageButtons = {}): void => {
  useDashboardStore.setState({ config: null, past: [], future: [] })
  useDashboardStore.getState().setConfig(configWith(pageButtons))
}

const buttons = () => useDashboardStore.getState().config?.pageButtons
const signal = (name: string) => useSignalStore.getState().signals.find((s) => s.name === name)

beforeEach(() => {
  useSignalStore.setState({ signals: [rpm, cruise] })
  start()
})

describe('savePageButton', () => {
  it('maps the default slot and assigns it on set', () => {
    savePageButton('next', first)
    savePageButton('previous', second)
    expect(buttons()).toEqual({ next: 'wheel_button_1', previous: 'wheel_button_2' })
    expect(signal('wheel_button_1')).toEqual(wheelButtonSignal('wheel_button_1', first))
    expect(signal('wheel_button_2')).toEqual(wheelButtonSignal('wheel_button_2', second))
  })

  it('moves the same slot on change', () => {
    savePageButton('next', first)
    savePageButton('next', second)
    expect(buttons()).toEqual({ next: 'wheel_button_1' })
    expect(signal('wheel_button_1')).toEqual(wheelButtonSignal('wheel_button_1', second))
  })
})

describe('savePageButton on an existing assignment', () => {
  it('edits an existing slot assignment instead of the default one', () => {
    start({ next: 'wheel_button_3' })
    savePageButton('next', first)
    expect(buttons()).toEqual({ next: 'wheel_button_3' })
    expect(signal('wheel_button_3')).toEqual(wheelButtonSignal('wheel_button_3', first))
    expect(signal('wheel_button_1')).toBeUndefined()
  })

  it('edits an existing custom signal and keeps its reading', () => {
    start({ previous: 'flag_cruise' })
    savePageButton('previous', first)
    expect(buttons()).toEqual({ previous: 'flag_cruise' })
    expect(signal('flag_cruise')).toMatchObject({ canFrameId: '0x1A2', startByte: 3, scale: 2 })
  })

  it('picks a free slot when the default one drives the other direction', () => {
    start({ next: 'wheel_button_2' })
    savePageButton('previous', first)
    expect(buttons()).toEqual({ next: 'wheel_button_2', previous: 'wheel_button_1' })
  })
})

describe('removePageButton', () => {
  it('unmaps the slot and clears the direction', () => {
    savePageButton('next', first)
    savePageButton('previous', second)
    removePageButton('next')
    expect(buttons()).toEqual({ previous: 'wheel_button_2' })
    expect(signal('wheel_button_1')).toBeUndefined()
  })

  it('keeps a custom signal and a slot the other direction still uses', () => {
    start({ next: 'flag_cruise', previous: 'wheel_button_1' })
    useSignalStore.getState().putSignal(wheelButtonSignal('wheel_button_1', first))
    removePageButton('next')
    expect(signal('flag_cruise')).toEqual(cruise)
    start({ next: 'wheel_button_1', previous: 'wheel_button_1' })
    removePageButton('next')
    expect(signal('wheel_button_1')).toBeDefined()
    expect(buttons()).toEqual({ previous: 'wheel_button_1' })
  })
})
