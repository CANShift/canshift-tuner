import { describe, expect, it } from 'vitest'
import { produce } from 'immer'
import type { DashboardConfig } from '@canshift/core'
import { DEFAULT_SIM_CONFIG } from '../../config/default-sim-config'
import { DEFAULT_SIM_SIGNALS } from '../../config/default-sim-signals'
import { diffSetup } from './diff-setup'
import { revertAll, revertChange } from './revert'
import type { DashSetup } from './setup'

const device: DashSetup = {
  dashboard: DEFAULT_SIM_CONFIG,
  settings: { deviceConfig: { canSpeedKbps: 500 }, brightness: 80, rotation: null, dayMode: null },
  car: { profileKey: 'demo:canshift', signals: DEFAULT_SIM_SIGNALS },
}

const edit = (recipe: (config: DashboardConfig) => void): DashSetup => ({
  ...device,
  dashboard: produce(DEFAULT_SIM_CONFIG, recipe),
})

const gaugeConfig = (config: DashboardConfig, pageId: string, widgetId: string) => {
  const widget = config.pages.find((p) => p.id === pageId)?.widgets.find((w) => w.id === widgetId)
  return widget?.config as Record<string, unknown>
}

describe('diffSetup', () => {
  it('finds nothing when the draft is what the dash has', () => {
    expect(diffSetup(device, structuredClone(device))).toEqual([])
  })

  it('describes a renamed gauge with where, what and was', () => {
    const draft = edit((c) => {
      gaugeConfig(c, 'street', 'street_water').kicker = 'COOLANT'
    })
    expect(diffSetup(device, draft)).toMatchObject([
      { section: 'gauges', where: 'Gauges · Street', what: 'Renamed gauge to Coolant', was: '' },
    ])
  })

  it('names the limit and its old value', () => {
    const draft = edit((c) => {
      gaugeConfig(c, 'street', 'street_speed').dangerLevel = 250
    })
    const [change] = diffSetup(device, draft)
    expect(change?.what).toBe('Speed: danger above 250')
    expect(change?.was).toBe('Was 280')
    expect(change?.target).toEqual({ pageId: 'street', widgetId: 'street_speed' })
  })
})

describe('diffSetup across pages and settings', () => {
  it('lists an added and a removed gauge', () => {
    const draft = edit((c) => {
      const street = c.pages[0]
      const removed = street?.widgets.pop()
      if (removed && street) street.widgets.push({ ...removed, id: 'street_new' })
    })
    expect(diffSetup(device, draft).map((change) => change.was)).toEqual(['Was on the dash', 'New'])
  })

  it('reports device settings in the Dash section', () => {
    const draft: DashSetup = {
      ...device,
      settings: {
        deviceConfig: { canSpeedKbps: 250 },
        brightness: 60,
        rotation: null,
        dayMode: null,
      },
    }
    expect(diffSetup(device, draft).map((c) => [c.where, c.what, c.was])).toEqual([
      ['Dash', 'Brightness 60%', 'Was 80%'],
      ['Dash', 'CAN bus speed 250 kbit/s', 'Was 500 kbit/s'],
    ])
  })
})

describe('diffSetup for the whole setup', () => {
  it('counts the whole setup as one change while the dash has none', () => {
    expect(diffSetup({ ...device, dashboard: null }, device)).toHaveLength(1)
  })

  it('notices a page order change', () => {
    const draft = edit((c) => {
      c.pages.reverse()
    })
    expect(diffSetup(device, draft).map((c) => c.what)).toEqual(['Reordered the pages'])
  })
})

describe('revertChange', () => {
  it('undoes one change and keeps the others', () => {
    const draft = edit((c) => {
      gaugeConfig(c, 'street', 'street_speed').dangerLevel = 250
      gaugeConfig(c, 'track', 'track_rpm').kicker = 'REVS'
    })
    const [first] = diffSetup(device, draft)
    if (!first) throw new Error('expected a change')
    const reverted = revertChange(draft, device, first)
    expect(diffSetup(device, reverted)).toHaveLength(1)
  })
})

describe('revertChange on lists', () => {
  it('puts a removed gauge back where it was', () => {
    const draft = edit((c) => {
      c.pages[0]?.widgets.splice(1, 1)
    })
    const [removal] = diffSetup(device, draft)
    if (!removal) throw new Error('expected a change')
    const reverted = revertChange(draft, device, removal)
    expect(reverted.dashboard?.pages[0]?.widgets.map((w) => w.id)).toEqual(
      DEFAULT_SIM_CONFIG.pages[0]?.widgets.map((w) => w.id)
    )
  })

  it('restores the page order', () => {
    const draft = edit((c) => {
      c.pages.reverse()
    })
    const [order] = diffSetup(device, draft)
    if (!order) throw new Error('expected a change')
    expect(diffSetup(device, revertChange(draft, device, order))).toEqual([])
  })

  it('undoes a device setting', () => {
    const draft: DashSetup = { ...device, settings: { ...device.settings, brightness: 30 } }
    const [change] = diffSetup(device, draft)
    if (!change) throw new Error('expected a change')
    expect(revertChange(draft, device, change).settings.brightness).toBe(80)
  })
})

describe('revertAll', () => {
  it('makes the draft what the dash has', () => {
    const draft = edit((c) => {
      c.pages.pop()
    })
    expect(diffSetup(device, revertAll(draft, device))).toEqual([])
  })
})

describe('diffSetup for the car', () => {
  const adjusted = (): DashSetup => ({
    ...device,
    car: {
      profileKey: 'demo:canshift',
      signals: DEFAULT_SIM_SIGNALS.map((signal) =>
        signal.name === 'rpm' ? { ...signal, scale: 2 } : signal
      ),
    },
  })

  it('lists an adjusted reading in the Car section and undoes it', () => {
    const [change] = diffSetup(device, adjusted())
    expect(change).toMatchObject({ section: 'car', where: 'Car', what: 'Adjusted the RPM reading' })
    if (!change) throw new Error('expected a change')
    expect(diffSetup(device, revertChange(adjusted(), device, change))).toEqual([])
  })

  it('reads a new car as one change, back to the old car on undo', () => {
    const draft: DashSetup = {
      ...device,
      car: { profileKey: 'builtin:maxxecu-street', signals: [] },
    }
    const changes = diffSetup(device, draft)
    expect(changes).toHaveLength(1)
    const [change] = changes
    if (!change) throw new Error('expected a change')
    expect(revertChange(draft, device, change).car).toEqual(device.car)
  })
})

describe('diffSetup full-screen alerts', () => {
  const alert = {
    signal: 'oil_press_bar',
    firesAt: 1,
    direction: 'below',
    acknowledgeOn: 'dash',
  } as const

  it('reads a changed list as one Dash change and undoes it', () => {
    const draft = edit((c) => {
      c.criticalAlerts = [alert, { ...alert, firesAt: 0.5 }]
    })
    const [change] = diffSetup(device, draft)
    expect(change).toMatchObject({ section: 'dash', what: 'Changed the full-screen alerts' })
    if (!change) throw new Error('expected a change')
    expect(diffSetup(device, revertChange(draft, device, change))).toEqual([])
  })

  it('names a list emptied on the draft', () => {
    const withAlerts: DashSetup = edit((c) => {
      c.criticalAlerts = [alert]
    })
    const [change] = diffSetup(withAlerts, device)
    expect(change?.what).toBe('Removed every full-screen alert')
  })
})
