import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { STRINGS } from '../../strings'
import { useDashboardStore } from '../../stores/dashboard.store'
import { GaugeEditor } from './GaugeEditor'
import { drivesAlert } from '../../lib/gauges/alert-link'

const street = DEFAULT_SIM_CONFIG.pages[0]
const water = street?.widgets.find((widget) => widget.id === 'street_water')
if (!street || !water) throw new Error('the demo config has a Street water gauge')

const render = (): string =>
  renderToStaticMarkup(
    <MemoryRouter>
      <GaugeEditor page={street} widget={water} />
    </MemoryRouter>
  )

beforeEach(() => {
  useDashboardStore.getState().setConfig(DEFAULT_SIM_CONFIG)
})

describe('GaugeEditor', () => {
  it('offers the gauge limits as warning and danger', () => {
    const html = render()
    expect(html).toContain(STRINGS.gauges.warningAbove)
    expect(html).toContain(STRINGS.gauges.dangerAbove)
  })
})

describe('drivesAlert', () => {
  const alert = {
    signal: water.signal,
    firesAt: 120,
    direction: 'above',
    acknowledgeOn: 'dash',
  } as const

  it('links a gauge to the full-screen alert only when it shows the alert signal', () => {
    expect(drivesAlert(alert, water)).toBe(true)
    expect(drivesAlert(alert, { signal: 'rpm' })).toBe(false)
    expect(drivesAlert(undefined, water)).toBe(false)
  })
})
