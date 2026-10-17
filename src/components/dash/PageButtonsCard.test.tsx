import { renderToStaticMarkup } from 'react-dom/server'
import type { PageButtonRole, PageButtons } from '@canshift/core'
import { WHEEL_BUTTON_SIGNALS } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { STRINGS } from '../../strings'
import type { WheelButtonSlot } from '../../hooks/useWheelButtons'
import { PageButtonsPanel } from './PageButtonsCard'

const D = STRINGS.dash

const slots = (pressed: string | null): WheelButtonSlot[] =>
  WHEEL_BUTTON_SIGNALS.map((slot) => ({
    slot,
    mapping: { frameId: 0x1a0, byte: 0, bit: 0 },
    pressed: slot === pressed,
  }))

const render = (buttons: PageButtons, pressed: string | null = null): string =>
  renderToStaticMarkup(
    <PageButtonsPanel
      editor={{
        slots: slots(pressed),
        signalOf: (role: PageButtonRole) => buttons[role],
        set: () => undefined,
      }}
    />
  )

const lit = (html: string): number => html.split('data-pressed="true"').length - 1

describe('PageButtonsPanel', () => {
  it('shows both directions with the hint and the tap-edge hint', () => {
    const html = render({})
    expect(html).toContain(D.pageButtons)
    expect(html).toContain(D.nextPage)
    expect(html).toContain(D.previousPage)
    expect(html).toContain(D.pageButtonsHint)
    expect(html).toContain(D.tapEdgesHint)
    expect(lit(html)).toBe(0)
  })

  it('lights only the direction whose slot is pressed', () => {
    const buttons = { next: 'wheel_button_1', previous: 'wheel_button_2' }
    expect(lit(render(buttons, 'wheel_button_1'))).toBe(1)
    expect(lit(render(buttons, 'wheel_button_3'))).toBe(0)
  })
})
