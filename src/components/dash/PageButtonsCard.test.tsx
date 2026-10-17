import { renderToStaticMarkup } from 'react-dom/server'
import type { PageButtons, SignalDef } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { STRINGS } from '../../strings'
import { signalName } from '../../lib/sync/describe'
import { wheelButtonSignal } from '../../lib/car/wheel-buttons'
import { PAGE_BUTTON_ROLES, pageButtonState } from '../../lib/car/page-buttons'
import { PageButtonsPanel } from './PageButtonsCard'

const C = STRINGS.car
const D = STRINGS.dash

const signals: SignalDef[] = [
  wheelButtonSignal('wheel_button_1', { frameId: 0x1a2, byte: 3, bit: 0 }),
  wheelButtonSignal('flag_cruise', { frameId: 0x300, byte: 1, bit: null }),
]

const render = (buttons: PageButtons, live: Record<string, number> = {}): string =>
  renderToStaticMarkup(
    <PageButtonsPanel
      editor={{
        buttons: PAGE_BUTTON_ROLES.map((role) => pageButtonState(role, buttons, signals, live)),
        save: () => undefined,
        remove: () => undefined,
      }}
    />
  )

const lit = (html: string): number => html.split('data-pressed="true"').length - 1

describe('PageButtonsPanel', () => {
  it('shows both directions unset with the hints', () => {
    const html = render({})
    expect(html).toContain(D.pageButtons)
    expect(html).toContain(D.nextPage)
    expect(html).toContain(D.previousPage)
    expect(html).toContain(D.pageButtonsHint)
    expect(html).toContain(D.tapEdgesHint)
    expect(html.split(D.notSet)).toHaveLength(3)
    expect(html).toContain(`aria-label="${C.setButton} ${D.nextPage}"`)
    expect(lit(html)).toBe(0)
  })

  it('shows the mapping of a set direction and offers to change it', () => {
    const html = render({ next: 'wheel_button_1' })
    expect(html).toContain('Frame 0x1A2 · byte 3 · bit 0')
    expect(html).toContain(`aria-label="${C.changeButton} ${D.nextPage}"`)
    expect(html).toContain(`aria-label="${C.setButton} ${D.previousPage}"`)
  })

  it('lights only a set direction whose button is pressed', () => {
    expect(lit(render({ next: 'wheel_button_1' }, { wheel_button_1: 1 }))).toBe(1)
    expect(lit(render({}, { wheel_button_1: 1 }))).toBe(0)
  })

  it('names an existing custom signal instead of a slot', () => {
    const html = render({ previous: 'flag_cruise' })
    expect(html).toContain(`${signalName('flag_cruise')} · Frame 0x300 · byte 1`)
    expect(html).toContain(`aria-label="${C.changeButton} ${D.previousPage}"`)
  })
})
