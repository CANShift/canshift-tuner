import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FIRMWARE_CAPS } from '@canshift/core'
import { Sheet } from '@/components/ui/sheet'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { DEFAULT_SIM_SIGNALS } from '../../config/default-sim-signals'
import { STRINGS } from '../../strings'
import { proposeCarPages } from '../../lib/gauges/car-pages'
import type { CarPageProposals } from '../../hooks/useCarPageProposals'
import { CarPagesPanel } from './CarPagesPanel'

const G = STRINGS.gauges
const noop = () => {}

const FOUND: CarPageProposals = {
  proposals: proposeCarPages(DEFAULT_SIM_SIGNALS),
  usedCount: DEFAULT_SIM_SIGNALS.length,
  incoming: false,
}

const render = (
  found = FOUND,
  room: number = FIRMWARE_CAPS.MAX_PAGES,
  picked = new Set<string>()
) =>
  renderToStaticMarkup(
    <Sheet open>
      <CarPagesPanel
        {...{ found, room, picked }}
        topBar={DEFAULT_SIM_CONFIG.topBar}
        onToggle={noop}
        onBack={noop}
        onAdd={noop}
      />
    </Sheet>
  )

describe('CarPagesPanel', () => {
  it('offers the pages the car can fill, none picked yet', () => {
    const html = render()
    expect(html).toContain(G.carPageAbout.street)
    expect(html).toContain(G.carPageAbout.track)
    expect(html).toContain(G.carPageAbout.engine)
    expect(html).toContain(G.pickPages)
    expect(html).toContain(G.fromDefined(DEFAULT_SIM_SIGNALS.length))
  })

  it('names the signals coming in when the car is connected', () => {
    expect(render({ ...FOUND, incoming: true, usedCount: 12 })).toContain(G.fromIncoming(12))
  })

  it('counts the picked pages and locks the rest once the dash is full', () => {
    const html = render(FOUND, 1, new Set(['street']))
    expect(html).toContain(G.addPages(1))
    expect(html).toContain(G.roomFor(1))
    expect(
      html.split('role="checkbox"').filter((part) => part.includes('data-disabled')).length
    ).toBe(2)
  })

  it('points to the layouts when the car has too few signals', () => {
    expect(render({ ...FOUND, proposals: [] })).toContain(G.notEnoughSignals)
  })
})
