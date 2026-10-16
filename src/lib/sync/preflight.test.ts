import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import { ECU_PROFILES } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { STRINGS } from '../../strings'
import { preflightRefusals } from './preflight'

const signals = ECU_PROFILES.flatMap((profile) => profile.signals)

const inputs = { config: DEFAULT_SIM_CONFIG, signals, firmwareMismatch: false }

describe('preflightRefusals', () => {
  it('names the gauge and page whose signal the car does not send', () => {
    const config = produce(DEFAULT_SIM_CONFIG, (c) => {
      const widget = c.pages[0]?.widgets[0]
      if (widget) widget.signal = 'not_a_signal'
    })
    const reasons = preflightRefusals({ ...inputs, config }).filter(
      (reason) => reason.target?.widgetId === DEFAULT_SIM_CONFIG.pages[0]?.widgets[0]?.id
    )
    expect(reasons).toEqual([
      {
        where: 'Gauges · Street',
        text: STRINGS.refused.unknownSignal('Not A Signal', 'Street'),
        target: { pageId: 'street', widgetId: 'street_speed' },
        section: 'gauges',
      },
    ])
  })
})

describe('preflightRefusals beyond signals', () => {
  it('stops a send the firmware is too old for', () => {
    const reasons = preflightRefusals({ ...inputs, firmwareMismatch: true })
    expect(reasons.map((reason) => reason.text)).toContain(STRINGS.refused.newerFirmware)
  })

  it('refuses a page with more gauges than the dash can hold', () => {
    const config = produce(DEFAULT_SIM_CONFIG, (c) => {
      const page = c.pages[0]
      const first = page?.widgets[0]
      if (!page || !first) return
      for (let i = 0; i < 13; i += 1) page.widgets.push({ ...first, id: `extra_${String(i)}` })
    })
    const texts = preflightRefusals({ ...inputs, config }).map((reason) => reason.text)
    expect(texts).toContain(STRINGS.refused.tooManyGauges('Street'))
  })
})
