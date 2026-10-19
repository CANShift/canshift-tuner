import { describe, expect, it } from 'vitest'
import { patchWidget, pairWidget, type WidgetFields } from './widget-patch'

const fields = {
  id: 'w1',
  signal: 'rpm',
  layout: { col: 0, colSpan: 3, row: 0, rowSpan: 2, zOrder: 0 },
  style: {},
} as unknown as WidgetFields

const image = pairWidget(fields, { type: 'image', imagePath: '/logo.png' })

describe('widget patch', () => {
  it('takes the widget type from its config', () => {
    expect(image.type).toBe('image')
  })

  it('retypes the widget when the patch carries another config', () => {
    const timer = patchWidget(image, { config: { type: 'timer', source: 'lap' }, signal: '' })
    expect(timer).toMatchObject({ type: 'timer', signal: '', config: { type: 'timer' } })
  })

  it('keeps type and config when the patch leaves config out', () => {
    const moved = patchWidget(image, { signal: 'map' })
    expect(moved).toMatchObject({ type: 'image', signal: 'map', config: image.config })
  })
})
