import { describe, expect, it } from 'vitest'
import { WidgetSchema } from '@canshift/core'
import { PALETTE_ITEMS, buildWidget, retypeWidget } from './new-widget'

const SCHEMA_WIDGET_TYPES = ['gauge', 'warning', 'button', 'timer', 'gear', 'image', 'shift_light']

describe('the Add menu', () => {
  it('offers every widget type the dash knows', () => {
    expect(PALETTE_ITEMS.map((item) => item.type).sort()).toEqual([...SCHEMA_WIDGET_TYPES].sort())
  })

  it.each(PALETTE_ITEMS.map((item) => [item.type, item] as const))(
    'builds a %s the dash accepts',
    (_type, item) => {
      expect(WidgetSchema.safeParse(buildWidget(item)).error).toBeUndefined()
    }
  )

  it('keeps the signal when a gauge becomes a warning light', () => {
    const gauge = { ...buildWidget(PALETTE_ITEMS[0]!), signal: 'coolant_temp' }
    expect(retypeWidget(gauge, 'warning')).toMatchObject({
      config: { type: 'warning' },
      signal: 'coolant_temp',
    })
  })

  it('clears the signal for a widget type that has none', () => {
    const gauge = buildWidget(PALETTE_ITEMS[0]!)
    expect(retypeWidget(gauge, 'image')).toMatchObject({ config: { type: 'image' }, signal: '' })
  })
})
