import { renderToStaticMarkup } from 'react-dom/server'
import { WHEEL_BUTTON_SIGNALS } from '@canshift/core'
import { describe, expect, it } from 'vitest'
import { STRINGS } from '../../strings'
import type { WheelButtonSlot } from '../../hooks/useWheelButtons'
import { WheelButtonsPanel } from './WheelButtonsCard'

const C = STRINGS.car

const render = (slots: WheelButtonSlot[]): string =>
  renderToStaticMarkup(
    <WheelButtonsPanel editor={{ slots, map: () => undefined, unmap: () => undefined }} />
  )

describe('WheelButtonsPanel', () => {
  it('lists the four slots, unmapped by default', () => {
    const html = render(
      WHEEL_BUTTON_SIGNALS.map((slot) => ({ slot, mapping: null, pressed: false }))
    )
    expect(html).toContain(C.wheelButton(1))
    expect(html).toContain(C.wheelButton(4))
    expect(html.split(C.notMapped)).toHaveLength(5)
  })

  it('shows a mapping and lights the pressed slot', () => {
    const html = render([
      { slot: 'wheel_button_1', mapping: { frameId: 0x1a0, byte: 2, bit: 3 }, pressed: true },
    ])
    expect(html).toContain(C.mappingText('0x1A0', 2, 3))
    expect(html).toContain('data-pressed="true"')
    expect(html).toContain(C.changeButton)
  })
})
