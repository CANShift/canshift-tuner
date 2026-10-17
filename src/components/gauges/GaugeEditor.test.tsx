import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { STRINGS } from '../../strings'
import { useDashboardStore } from '../../stores/dashboard.store'
import { GaugeEditor } from './GaugeEditor'
import { alertDrivenBy } from '../../lib/gauges/alert-link'

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

describe('alertDrivenBy', () => {
  const alertOn = (signal: string, firesAt: number) =>
    ({ signal, firesAt, direction: 'above', acknowledgeOn: 'dash' }) as const

  it('links a gauge to the first full-screen alert that watches its signal', () => {
    const alerts = [alertOn('rpm', 7000), alertOn(water.signal, 120), alertOn(water.signal, 130)]
    expect(alertDrivenBy(alerts, water)).toEqual(alertOn(water.signal, 120))
    expect(alertDrivenBy(alerts, { signal: 'oil_temp_c' })).toBeUndefined()
    expect(alertDrivenBy([], water)).toBeUndefined()
  })

  it('never links a gauge without a signal', () => {
    expect(alertDrivenBy([alertOn('', 1)], { signal: '' })).toBeUndefined()
  })
})
